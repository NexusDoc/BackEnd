# BackEnd/src/configs/errors/api_errors/handlers.py
from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import IntegrityError

from src.configs.errors.api_errors.models_error import ProblemDetails
from src.configs.errors.domains_errors.error import (
    UserNotFoundError, InvalidCredentialsError, EmailAlreadyExistsError
)

def _problem(request: Request, *, status: int, title: str, detail: str, code: str | None = None):
    body = ProblemDetails(
        type="about:blank",
        title=title,
        status=status,
        detail=detail,
        instance=str(request.url.path),
        code=code,
        extras={"timestamp": datetime.utcnow().isoformat() + "Z"},
    ).model_dump()
    return JSONResponse(status_code=status, content=body, media_type="application/problem+json")

def setup_exception_handlers(app: FastAPI):

    @app.exception_handler(UserNotFoundError)
    async def user_not_found_handler(request: Request, exc: UserNotFoundError):
        return _problem(request, status=404, title="Recurso não encontrado", detail=str(exc), code=exc.code)

    @app.exception_handler(InvalidCredentialsError)
    async def invalid_credentials_handler(request: Request, exc: InvalidCredentialsError):
        # 401 (não autenticado) – você pode também devolver 403, conforme sua política
        resp = _problem(request, status=401, title="Não autorizado", detail=str(exc), code=exc.code)
        # opcional: header WWW-Authenticate para fluxos OAuth2
        resp.headers["WWW-Authenticate"] = "Bearer"
        return resp

    @app.exception_handler(EmailAlreadyExistsError)
    async def email_conflict_handler(request: Request, exc: EmailAlreadyExistsError):
        return _problem(request, status=409, title="Conflito", detail=str(exc), code=exc.code)

    # Erros de validação dos schemas (422)
    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(request: Request, exc: RequestValidationError):
        # simplifica mensagens para o cliente final (pt-BR)
        return _problem(
            request, status=422, title="Dados inválidos",
            detail="Um ou mais campos estão inválidos. Verifique e tente novamente.",
            code="VALIDATION_ERROR"
        )

    # 404/405 etc. levantados pelo Starlette/FastAPI (rotas inexistentes, método não permitido)
    @app.exception_handler(StarletteHTTPException)
    async def http_error_handler(request: Request, exc: StarletteHTTPException):
        # Customiza mensagens padrão em PT-BR
        titles = {
            404: "Recurso não encontrado",
            405: "Método não permitido",
            401: "Não autorizado",
            403: "Proibido",
        }
        details = {
            404: "A rota solicitada não foi encontrada.",
            405: "O método HTTP não é permitido para esta rota.",
            401: "Credenciais não fornecidas ou inválidas.",
            403: "Você não tem permissão para acessar este recurso.",
        }
        title = titles.get(exc.status_code, "Erro")
        detail = details.get(exc.status_code, exc.detail if exc.detail else "Ocorreu um erro.")
        return _problem(request, status=exc.status_code, title=title, detail=detail)

    # Conflitos de banco (chave única, etc.)
    @app.exception_handler(IntegrityError)
    async def sqlalchemy_integrity_handler(request: Request, exc: IntegrityError):
        # Tente detectar violação de unique em 'email'
        msg = "E-mail já cadastrado." if "email" in str(exc).lower() else "Violação de integridade."
        return _problem(request, status=409, title="Conflito", detail=msg, code="INTEGRITY_ERROR")

    # Guarda-chuva: qualquer erro não tratado
    @app.exception_handler(Exception)
    async def unhandled_handler(request: Request, exc: Exception):
        return _problem(
            request,
            status=500,
            title="Erro interno",
            detail="Estamos com um problema em nosso servidor. Recarregue a página ou tente mais tarde.",
            code="INTERNAL_SERVER_ERROR",
        )
