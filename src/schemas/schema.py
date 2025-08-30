# BackEnd/src/schemas/schema.py
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
import re

_PHONE = 11

def _normalize_phone(v: Optional[str]) -> Optional[str]:
    if v is None:
        return None
    digits = "".join(ch for ch in v if ch.isdigit())
    if _PHONE > len(digits) or _PHONE < len(digits):
        raise ValueError(f"telefone inválido: precisa ter {_PHONE} dígitos")
    return digits

class UserBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    cell_phone: Optional[str] = Field(None, alias="cellPhone")

    @field_validator("name")
    @classmethod
    def _trim_name(cls, v: str) -> str:
        v2 = v.strip()
        if len(v2) < 2:
            raise ValueError("nome muito curto")
        return v2

    @field_validator("email", mode="before")
    @classmethod
    def _normalize_email(cls, v):
        # normaliza para lower-case e devolve str; o campo EmailStr valida depois
        return str(v).strip().lower() if v is not None else v

    @field_validator("cell_phone", mode="before")
    @classmethod
    def _val_phone(cls, v: Optional[str]) -> Optional[str]:
        return _normalize_phone(v)

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def _check_password(cls, v: str) -> str:
        if not re.search(r"[A-Za-z]", v) or not re.search(r"\d", v):
            raise ValueError("senha deve conter letras e números")
        return v

class UserUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: Optional[str] = Field(None, min_length=2, max_length=120)
    email: Optional[EmailStr] = None
    cell_phone: Optional[str] = Field(None, alias="cellPhone")
    password: Optional[str] = Field(None, min_length=8, max_length=128)

    @field_validator("name")
    @classmethod
    def _trim_name(cls, v: Optional[str]) -> Optional[str]:
        return v.strip() if isinstance(v, str) else v

    @field_validator("email", mode="before")
    @classmethod
    def _normalize_email(cls, v):
        return str(v).strip().lower() if v is not None else v

    @field_validator("cell_phone", mode="before")
    @classmethod
    def _val_phone(cls, v: Optional[str]) -> Optional[str]:
        return _normalize_phone(v)

    @field_validator("password")
    @classmethod
    def _check_password(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not re.search(r"[A-Za-z]", v) or not re.search(r"\d", v):
            raise ValueError("senha deve conter letras e números")
        return v

class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    name: str
    email: EmailStr
    cell_phone: Optional[str] = Field(None, alias="cellPhone")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
