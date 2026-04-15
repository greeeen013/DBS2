from dataclasses import dataclass

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.orm import Session

from auth.jwt import dekoduj_token
from db.dependencies import get_db
from models.member import Member

_bearer = HTTPBearer()


@dataclass
class CurrentUser:
    """Přihlášený uživatel – kombinuje data z JWT tokenu a DB."""
    member_id: int
    role: str


def get_current_member(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: Session = Depends(get_db),
) -> CurrentUser:
    """Vrátí CurrentUser z JWT tokenu nebo vyhodí 401."""
    try:
        payload = dekoduj_token(credentials.credentials)
        member_id = int(payload["sub"])
        role = payload["role"]
    except (JWTError, KeyError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Neplatný nebo prošlý token",
        )

    if not db.get(Member, member_id):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Člen neexistuje")

    return CurrentUser(member_id=member_id, role=role)


def require_admin(current: CurrentUser = Depends(get_current_member)) -> CurrentUser:
    """Vyhodí 403, pokud přihlášený člen nemá roli 'admin'."""
    if current.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Nedostatečná oprávnění")
    return current
