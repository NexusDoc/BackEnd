# Responsável apenas por gerar o hash de senha (Argon2id) sem bloquear o event loop.
from anyio import to_thread
from passlib.hash import argon2

async def hash_password(password: str) -> str:
    """
    Gera hash Argon2id para a senha recebida do frontend (Vue).
    Valide a política de senha antes (mínimo, complexidade etc.) no schema/camada de apresentação.
    """
    if not isinstance(password, str) or len(password) < 8:
        raise ValueError("senha inválida")
    # Executa o hashing em threadpool para não bloquear a app async
    return await to_thread.run_sync(argon2.hash, password)
