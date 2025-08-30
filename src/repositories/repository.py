# BackEnd/src/repositories/repository.py
from __future__ import annotations
from typing import Optional, Sequence

from sqlalchemy import select, update, delete
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.user_model import User

class UserRepository:
    """
    Responsável somente por CRUD no banco (SRP).
    Não faz hashing nem valida payload HTTP.
    """

    def __init__(self, session: AsyncSession):
        self.session = session

    # ---------- CREATE ----------
    async def create(
        self,
        *,
        name: str,
        email: str,
        cell_phone: Optional[str],
        password_hash: str,
    ) -> User:
        obj = User(
            name=name.strip(),
            email=email.strip().lower(),
            cell_phone=cell_phone,
            password_hash=password_hash,
        )
        self.session.add(obj)
        try:
            await self.session.commit()
        except IntegrityError:
            await self.session.rollback()
            # Deixe propagar ou converta para sua exceção de domínio
            raise
        await self.session.refresh(obj)
        return obj

    # ---------- READ ----------
    async def get_by_id(self, user_id: int) -> Optional[User]:
        res = await self.session.execute(select(User).where(User.id == user_id))
        return res.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        res = await self.session.execute(
            select(User).where(User.email == email.strip().lower())
        )
        return res.scalar_one_or_none()

    async def list(self, *, offset: int = 0, limit: int = 50) -> Sequence[User]:
        res = await self.session.execute(
            select(User).order_by(User.id.asc()).offset(offset).limit(limit)
        )
        return res.scalars().all()

    # ---------- UPDATE ----------
    async def update(
        self,
        user_id: int,
        *,
        name: Optional[str] = None,
        email: Optional[str] = None,
        cell_phone: Optional[str] = None,
        password_hash: Optional[str] = None,
    ) -> Optional[User]:
        obj = await self.get_by_id(user_id)
        if not obj:
            return None

        if name is not None:
            obj.name = name.strip()
        if email is not None:
            obj.email = email.strip().lower()
        if cell_phone is not None:
            obj.cell_phone = cell_phone
        if password_hash is not None:
            obj.password_hash = password_hash

        try:
            await self.session.commit()
        except IntegrityError:
            await self.session.rollback()
            raise
        await self.session.refresh(obj)
        return obj

    # ---------- DELETE ----------
    async def delete(self, user_id: int) -> bool:
        obj = await self.get_by_id(user_id)
        if not obj:
            return False
        await self.session.delete(obj)
        await self.session.commit()
        return True
