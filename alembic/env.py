# BackEnd/alembic/env.py
from __future__ import annotations

import os
import sys
from pathlib import Path
from configparser import ConfigParser
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config

# === Paths ===
BACKEND_DIR = Path(__file__).resolve().parents[1]  # .../<repo>/BackEnd
SRC_DIR = BACKEND_DIR / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

# === .env ===
try:
    from dotenv import load_dotenv
    ok = load_dotenv(BACKEND_DIR / ".env")
    if not ok:
        load_dotenv(BACKEND_DIR.parent / ".env")
except Exception:
    pass

# === Settings ===
try:
    from configs.infra.settings.setting import settings
except ImportError:
    settings = None

config = context.config

# === Logging tolerante ===
if config.config_file_name:
    try:
        cp = ConfigParser()
        cp.read(config.config_file_name)
        if cp.has_section("loggers") and cp.has_section("handlers") and cp.has_section("formatters"):
            fileConfig(config.config_file_name)
    except Exception:
        pass

# === Models ===
from models.user_model import Base
target_metadata = Base.metadata


def get_db_url() -> str:
    url = os.getenv("DATABASE_URL")
    if not url and settings:
        url = settings.database_url
    if not url:
        section = config.get_section(config.config_ini_section) or {}
        url = section.get("sqlalchemy.url")
    if not url:
        raise RuntimeError(
            "DATABASE_URL não definido e 'sqlalchemy.url' ausente no alembic.ini. "
            "Defina no BackEnd/.env ou configure sqlalchemy.url no alembic.ini."
        )
    # injeta no config (algumas APIs de engine leem daqui)
    config.set_main_option("sqlalchemy.url", url)
    return url


def run_migrations_offline():
    url = get_db_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
        # ⚠️ NADA de include_schemas aqui
        # include_schemas=False  # (padrão)
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    url = get_db_url()
    section = config.get_section(config.config_ini_section) or {}
    connectable = async_engine_from_config(
        section,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        url=url,  # passa explicitamente
    )

    import asyncio

    async def _run():
        async with connectable.connect() as connection:
            # configura o contexto usando SOMENTE o schema atual (da URL)
            await connection.run_sync(
                lambda sync_conn: context.configure(
                    connection=sync_conn,
                    target_metadata=target_metadata,
                    compare_type=True,
                    # ⚠️ não varrer todas as schemas
                    # include_schemas=False
                )
            )
            await connection.run_sync(lambda _: context.run_migrations())
        await connectable.dispose()

    asyncio.run(_run())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
