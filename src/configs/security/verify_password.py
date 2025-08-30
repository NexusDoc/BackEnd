# Responsável por verificar senha em claro contra um hash armazenado.
from anyio import to_thread
from passlib.hash import argon2

async def verify_password(raw_password: str, stored_hash: str) -> bool:
    """
    Retorna True se a senha em claro corresponder ao hash armazenado.
    Protege contra hashes inválidos e mantém execução fora do event loop.
    """
    if not stored_hash or not isinstance(raw_password, str):
        return False
    try:
        return await to_thread.run_sync(argon2.verify, raw_password, stored_hash)
    except Exception:
        # hash corrompido/formato inesperado
        return False
