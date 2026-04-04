# Router pro autentizaci – přihlášení členů.
#
# POST /auth/login – ověří email + heslo, vrátí JWT token.

from fastapi import APIRouter, Depends, HTTPException, status
import bcrypt
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from auth.jwt import vytvor_token
from db.dependencies import get_db
from models.member import Member

router = APIRouter(prefix="/auth", tags=["Auth"])

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    return bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    surname: str
    email: str
    password: str = Field(..., max_length=72)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    member_id: int
    name: str


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """Ověří přihlašovací údaje a vrátí JWT token a info o uživateli."""
    clen = db.query(Member).filter(Member.email == data.email).first()
    if not clen or not clen.password_hash or not verify_password(data.password, clen.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nesprávný e-mail nebo heslo",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = vytvor_token(member_id=clen.member_id, role=clen.role)
    return {"access_token": token, "member_id": clen.member_id, "name": clen.name}


@router.post("/register", response_model=TokenResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    """Registruje nového člena a rovnou ho přihlásí (vrací stejnou strukturu jako login)."""
    existujici = db.query(Member).filter(Member.email == data.email).first()
    if existujici:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tento e-mail je již zaregistrován.",
        )
    
    novy_clen = Member(
        name=data.name,
        surname=data.surname,
        email=data.email,
        password_hash=hash_password(data.password),
        role="member",
        credit_balance=0,
    )
    db.add(novy_clen)
    db.commit()
    db.refresh(novy_clen)
    
    token = vytvor_token(member_id=novy_clen.member_id, role=novy_clen.role)
    return {"access_token": token, "member_id": novy_clen.member_id, "name": novy_clen.name}
