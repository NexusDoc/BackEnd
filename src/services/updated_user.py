from __future__ import annotations
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from src.repositories.repository import UserRepository
from src.schemas.schema import UserUpdate
from src.models.user_model import User
from src.configs.security.encrypt import hash_password

async def execute(session: AsyncSession, user_id: int, data: UserUpdate) -> Optional[User]:
    pwd_hash = await hash_password(data.password) if data.password else None

    repo = UserRepository(session)
    return await repo.update(
        user_id,
        name=data.name,
        email=str(data.email) if data.email else None,
        cell_phone=data.cell_phone,
        password_hash=pwd_hash,
    )
