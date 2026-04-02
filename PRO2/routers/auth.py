# Router pro autentizaci – přihlášení členů.
#
# POST /auth/login – ověří email + heslo, vrátí JWT token.

from fastapi import APIRouter, Depends, HTTPException, status
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth.jwt import vytvor_token
from db.dependencies import get_db
from models.member import Member

router = APIRouter(prefix="/auth", tags=["Autentizace"])

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """Ověří přihlašovací údaje a vrátí JWT token."""
    clen = db.query(Member).filter(Member.email == data.email).first()
    if not clen or not clen.password_hash or not _pwd.verify(data.password, clen.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nesprávný e-mail nebo heslo",
        )
    token = vytvor_token(member_id=clen.member_id, role=clen.role)
    return {"access_token": token}
