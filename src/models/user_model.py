# BackEnd/src/models/user_model.py
from __future__ import annotations
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Integer, DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# Você pode mover essa Base para um módulo "db.py" compartilhado.
class Base(DeclarativeBase):
    pass

class User(Base):
    """
    Modelo ORM da tabela de usuários.
    Não expõe senha em claro: guarda apenas password_hash.
    """
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    # Se quiser permitir telefone repetido entre usuários, troque unique=True para False.
    cell_phone: Mapped[Optional[str]] = mapped_column(String(15), nullable=True, unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    def __repr__(self) -> str:
        return f"User(id={self.id!r}, name={self.name!r}, email={self.email!r})"
