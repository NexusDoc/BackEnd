
from __future__ import annotations
from datetime import datetime, timedelta, timezone
from typing import Any, Dict

import jwt
from jwt import PyJWTError as JWTError
from fastapi import HTTPException, status

from configs.infra.settings.setting import settings

def _base_claims(subject: str, extra: Dict[str, Any] | None = None) -> Dict[str, Any]:
    now = datetime.now(tz=timezone.utc)
    data: Dict[str, Any] = {
        "sub": subject,
        "iss": settings.JWT_ISSUER,
        "aud": settings.JWT_AUDIENCE,
        "iat": int(now.timestamp()),
        "nbf": int(now.timestamp()),
    }
    if extra:
        data.update(extra)
    return data

def create_access_token(subject: str, extra: Dict[str, Any] | None = None) -> str:
    claims = _base_claims(subject, extra)
    exp = datetime.now(tz=timezone.utc) + timedelta(minutes=settings.JWT_ACCESS_EXPIRE_MIN)
    claims["exp"] = int(exp.timestamp())
    return jwt.encode(claims, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def create_refresh_token(subject: str) -> str:
    claims = _base_claims(subject)
    exp = datetime.now(tz=timezone.utc) + timedelta(minutes=settings.JWT_REFRESH_EXPIRE_MIN)
    claims["exp"] = int(exp.timestamp())
    claims["typ"] = "refresh"
    return jwt.encode(claims, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def decode_and_validate_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            audience=settings.JWT_AUDIENCE,
            issuer=settings.JWT_ISSUER,
            options={"verify_aud": True, "verify_iss": True},
        )
        return payload
    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido.") from e
