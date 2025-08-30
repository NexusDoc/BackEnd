from __future__ import annotations

from contextlib import asynccontextmanager
from fastapi import FastAPI

from src.controllers.user_controller import (
    router as users_router,
    auth_router as users_auth_router,
)
from src.configs.errors.api_errors.handlers import setup_exception_handlers
from src.configs.infra.persistence.db import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup (ex.: checar conexão, carregar caches, etc.)
    yield
    # Shutdown: fecha o engine do SQLAlchemy
    await engine.dispose()


app = FastAPI(
    title="CreatedCount API",
    version="1.0.0",
    lifespan=lifespan,
)

# Handlers globais de erros padronizados/PT-BR
setup_exception_handlers(app)

# Rotas
app.include_router(users_auth_router)  # /users/login, /users/me (JWT)
app.include_router(users_router)       # /users (CRUD)

# Healthcheck simples
@app.get("/health")
async def health():
    return {"status": "ok"}
