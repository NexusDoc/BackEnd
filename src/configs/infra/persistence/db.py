from __future__ import annotations
from typing import AsyncIterator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from src.configs.infra.settings.setting import settings

# Engine assíncrono (MySQL + asyncmy)
engine = create_async_engine(
    settings.database_url,
    echo=False,            # True para logar SQL
    pool_pre_ping=True,    # detecta conexões mortas antes de usar
    pool_size=5,           # ajuste à sua infra
    max_overflow=10,
    pool_recycle=1800,     # recicla conexões antigas (segundos)
)

# Factory de sessões
SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)

# >>> Provedor assíncrono de sessão (injete com Depends(get_session))
async def get_session() -> AsyncIterator[AsyncSession]:
    async with SessionLocal() as session:
        yield session
        # fechamento automático ao sair do context manager
