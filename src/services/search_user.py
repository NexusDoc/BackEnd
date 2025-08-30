from __future__ import annotations
from typing import Sequence
from sqlalchemy.ext.asyncio import AsyncSession

from src.repositories.repository import UserRepository
from src.models.user_model import User

async def execute(session: AsyncSession, *, offset: int = 0, limit: int = 100) -> Sequence[User]:
    repo = UserRepository(session)
    return await repo.list(offset=offset, limit=limit)
