from __future__ import annotations
from sqlalchemy.ext.asyncio import AsyncSession

from src.repositories.repository import UserRepository
from src.configs.security.verify_password import verify_password
from src.configs.errors.domains_errors.error import UserNotFoundError, InvalidCredentialsError

async def execute(session: AsyncSession, *, email: str, password: str) -> bool:
    repo = UserRepository(session)
    user = await repo.get_by_email(email)
    if not user:
        raise UserNotFoundError()

    ok = await verify_password(password, user.password_hash)
    if not ok:
        raise InvalidCredentialsError()

    return await repo.delete(user.id)
