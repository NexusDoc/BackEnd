from __future__ import annotations
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from configs.security.jwt import decode_and_validate_token
from configs.infra.persistence.db import get_session
from repositories.repository import UserRepository
from models.user_model import User

oauth2 = HTTPBearer(auto_error=True)

async def get_current_user(
    cred: HTTPAuthorizationCredentials = Depends(oauth2),
    session: AsyncSession = Depends(get_session),
) -> User:
    payload = decode_and_validate_token(cred.credentials)
    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token sem 'sub'.")
    repo = UserRepository(session)
    user = await repo.get_by_id(int(sub))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário do token não existe.")
    return user
