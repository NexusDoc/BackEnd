from __future__ import annotations

from typing import List, Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from src.configs.path_config.path import ENV_PATH

class Settings(BaseSettings):
    # ----------------------------
    # Banco de Dados
    # ----------------------------
    DATABASE_URL: Optional[str] = None

    DB_HOST: str = "127.0.0.1"
    DB_PORT: int = 3307
    DB_NAME: str = "createdcount"      # <- alinhado ao .env
    DB_USER: str = "createduser"
    DB_PASSWORD: str = "createdpass"

    # ----------------------------
    # Segurança
    # ----------------------------
    # Pepper opcional para senhas (concatenado antes do hash)
    PASSWORD_PEPPER: Optional[str] = None

    # JWT
    JWT_SECRET_KEY: Optional[str] = None  # defina no .env; exigido em runtime
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRES_MINUTES: int = 60
    JWT_ISSUER: Optional[str] = None
    JWT_AUDIENCE: Optional[str] = None

    # ----------------------------
    # App / CORS / Observabilidade
    # ----------------------------
    APP_NAME: str = "CreatedCount API"
    DEBUG: bool = False
    ENV: str = "local"

    # Pode ser lista no .env (JSON) ou string "a,b,c"
    CORS_ALLOW_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["*"]
    CORS_ALLOW_HEADERS: List[str] = ["*"]

    SENTRY_DSN: Optional[str] = None
    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=str(ENV_PATH),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ----------------------------
    # Validadores / Helpers
    # ----------------------------
    @field_validator("CORS_ALLOW_ORIGINS", mode="before")
    @classmethod
    def _split_cors_origins(cls, v):
        """
        Permite duas formas no .env:
        - CORS_ALLOW_ORIGINS=http://a.com,http://b.com
        - CORS_ALLOW_ORIGINS=["http://a.com","http://b.com"]
        """
        if isinstance(v, str):
            # se vier "a,b,c"
            items = [s.strip() for s in v.split(",") if s.strip()]
            return items
        return v

    @property
    def database_url(self) -> str:
        """
        Retorna a URL assíncrona do SQLAlchemy para uso na app e Alembic async.
        Respeita DATABASE_URL se definida no .env; caso contrário, monta pelos campos.
        """
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return (
            f"mysql+asyncmy://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"
        )

    @property
    def jwt_secret_required(self) -> str:
        """
        Garante que o segredo JWT está definido em runtime.
        Use onde for emitir/validar o token.
        """
        if not self.JWT_SECRET_KEY:
            raise RuntimeError("JWT_SECRET_KEY não definido no .env")
        return self.JWT_SECRET_KEY


settings = Settings()
