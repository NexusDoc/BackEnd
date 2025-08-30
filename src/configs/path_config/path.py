from __future__ import annotations
from pathlib import Path

def _find_project_root(start: Path | None = None) -> Path:
    """
    Sobe diretórios até achar um .env (ou .git) e usa como raiz do projeto.
    Funciona mesmo rodando o app de lugares diferentes.
    """
    p = (start or Path(__file__)).resolve()
    for ancestor in [p, *p.parents]:
        if (ancestor / ".env").exists() or (ancestor / ".git").exists():
            return ancestor
    return p.parents[-1]  # fallback: raiz do filesystem (improvável)

PROJECT_ROOT: Path = _find_project_root()
ENV_PATH: Path = PROJECT_ROOT / ".env"

__all__ = ["PROJECT_ROOT", "ENV_PATH"]
