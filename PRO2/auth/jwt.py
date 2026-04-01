# JWT utilitky – generování a ověřování tokenů.
#
# SECRET_KEY se načítá z env proměnné JWT_SECRET.
# Algoritmus: HS256, platnost tokenu: 8 hodin.

import os
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

SECRET_KEY: str = os.environ.get("JWT_SECRET", "dev-secret-change-in-production")
ALGORITHM = "HS256"
TOKEN_EXPIRY_HOURS = 8


def vytvor_token(member_id: int, role: str) -> str:
    """Vygeneruje JWT token s member_id a rolí."""
    payload = {
        "sub": str(member_id),
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRY_HOURS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def dekoduj_token(token: str) -> dict:
    """Dekóduje JWT token. Vyhodí JWTError při neplatném/prošlém tokenu."""
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
