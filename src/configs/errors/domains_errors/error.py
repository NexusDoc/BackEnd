# BackEnd/src/configs/errors/domain_errors/models_error.py

class DomainError(Exception):
    code: str = "DOMAIN_ERROR"
    default_message: str = "Ocorreu um erro."

    def __init__(self, message: str | None = None):
        super().__init__(message or self.default_message)

class UserNotFoundError(DomainError):
    code = "USER_NOT_FOUND"
    default_message = "O usuário não foi encontrado."

class InvalidCredentialsError(DomainError):
    code = "INVALID_CREDENTIALS"
    default_message = "Credenciais inválidas."

class EmailAlreadyExistsError(DomainError):
    code = "EMAIL_ALREADY_EXISTS"
    default_message = "E-mail já cadastrado."
