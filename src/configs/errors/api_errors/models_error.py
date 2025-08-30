# BackEnd/src/errors/api_errors/models_error.py

from pydantic import BaseModel, Field
from typing import Any, Optional

class ProblemDetails(BaseModel):
    type: str = Field(default="about:blank")       # URI identificando o tipo do erro (pode ser doc)
    title: str                                     # título curto (ex.: "Recurso não encontrado")
    status: int                                    # HTTP status
    detail: str                                    # mensagem amigável (pt-BR)
    instance: str                                  # caminho da requisição (ex.: "/users/123")
    code: Optional[str] = None                     # seu código interno (ex.: USER_NOT_FOUND)
    extras: Optional[dict[str, Any]] = None        # campos adicionais (opcional)
