from __future__ import annotations

from datetime import timedelta, timezone, datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt import PyJWTError as JWTError
import jwt
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.schemas.schema import UserCreate, UserUpdate, UserRead
from src.services import created_user, search_user, search_to_telefone, delet_user, updated_user
from src.configs.infra.persistence.db import get_session
from src.configs.infra.settings.setting import settings  # ✅ importa a instância correta
from src.models.user_model import User

# ------------------------------------------------------------
# Routers
# ------------------------------------------------------------
router = APIRouter(prefix="/users", tags=["Users"])
auth_router = APIRouter(prefix="/users", tags=["Auth"])  # /users/login

# ------------------------------------------------------------
# Segurança / JWT helpers
# ------------------------------------------------------------
bearer_scheme = HTTPBearer(auto_error=False)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

def _create_access_token(*, subject: str, additional_claims: Optional[dict] = None) -> TokenResponse:
    expires_minutes = int(settings.JWT_EXPIRES_MINUTES)
    expire_dt = datetime.now(tz=timezone.utc) + timedelta(minutes=expires_minutes)

    claims = {
        "sub": subject,
        "exp": expire_dt,
        "type": "access",
    }
    if additional_claims:
        claims.update(additional_claims)

    token = jwt.encode(
        claims,
        settings.jwt_secret_required,     # ✅ usa a property que garante o segredo
        algorithm=settings.JWT_ALGORITHM,
    )
    return TokenResponse(access_token=token, expires_in=expires_minutes * 60)

async def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    session: AsyncSession = Depends(get_session),
) -> User:
    if creds is None or creds.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Token ausente.")

    token = creds.credentials
    try:
        payload = jwt.decode(token, settings.jwt_secret_required, algorithms=[settings.JWT_ALGORITHM])  # ✅
        sub = payload.get("sub")
        if not sub:
            raise HTTPException(status_code=401, detail="Token inválido (sem 'sub').")
        user_id = int(sub)
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Token inválido.")

    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="Usuário do token não existe mais.")
    return user

# ---------------- DTOs ----------------
class Credentials(BaseModel):
    telefone: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=8, max_length=128)

# ---------------- LOGIN ----------------
@auth_router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def login(creds: Credentials, session: AsyncSession = Depends(get_session)) -> TokenResponse:
    try:
        user = await search_to_telefone.execute(session, telefone=str(creds.telefone), password=creds.password)
    except ValueError:
        raise HTTPException(status_code=404, detail="O usuário não foi encontrado.")
    except PermissionError:
        raise HTTPException(status_code=401, detail="Credenciais inválidas.")
    return _create_access_token(subject=str(user.id), additional_claims={"telefone": user.cell_phone})

# ---------------- CRIAR ----------------
@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=UserRead,
    responses={409: {"description": "Conflito (e-mail já cadastrado)"}, 422: {"description": "Dados inválidos"}},
)
async def create_user(data: UserCreate, session: AsyncSession = Depends(get_session)):
    user = await created_user.execute(session, data)
    return UserRead.model_validate(user).model_dump(by_alias=True)

# ---------------- ME ----------------
@router.get("/me", response_model=UserRead, responses={401: {"description": "Não autorizado"}})
async def me(current_user: User = Depends(get_current_user)):
    return UserRead.model_validate(current_user).model_dump(by_alias=True)

# ---------------- LISTAR ----------------
@router.get("", response_model=List[UserRead], responses={422: {"description": "Dados inválidos"}})
async def list_users(offset: int = 0, limit: int = 100, session: AsyncSession = Depends(get_session)):
    users = await search_user.execute(session, offset=offset, limit=limit)
    return [UserRead.model_validate(u).model_dump(by_alias=True) for u in users]

# ---------------- UPDATE ME ----------------
@router.api_route("/me", methods=["PUT", "PATCH"], response_model=UserRead,
                  responses={401: {"description": "Não autorizado"}, 422: {"description": "Dados inválidos"}})
async def update_me(data: UserUpdate, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    user = await updated_user.execute(session, current_user.id, data)
    return UserRead.model_validate(user).model_dump(by_alias=True)

# ---------------- UPDATE POR ID (mesmo do token) ----------------
@router.api_route(
    "/{user_id}",
    methods=["PUT", "PATCH"],
    response_model=UserRead,
    responses={401: {"description": "Não autorizado"}, 403: {"description": "Proibido"},
               404: {"description": "Usuário não encontrado"}, 422: {"description": "Dados inválidos"}},
)
async def update_user(user_id: int, data: UserUpdate, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Você só pode atualizar o seu próprio usuário.")
    user = await updated_user.execute(session, user_id, data)
    if not user:
        raise HTTPException(status_code=404, detail="O usuário não foi encontrado.")
    return UserRead.model_validate(user).model_dump(by_alias=True)

@router.delete(
    "/me",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={401: {"description": "Não autorizado"}},
)
async def delete_me(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),  # vem do JWT
):
    # Remove o próprio usuário autenticado
    await session.delete(current_user)
    await session.commit()
    return  # 204 No Content