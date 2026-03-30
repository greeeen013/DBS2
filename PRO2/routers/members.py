# Router pro endpointy členů.
#
# Zatím implementuji pouze dotaz na kreditový zůstatek (GET /members/{id}/balance),
# který frontend potřebuje pro zobrazení aktuálního stavu konta.
# Kompletní CRUD pro členy přijde v dalších iteracích.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.dependencies import get_db
from models.member import Member

router = APIRouter(prefix="/members", tags=["Členové"])


@router.get("/{member_id}/balance")
def zustatok_kreditů(member_id: int, db: Session = Depends(get_db)):
    """
    Vrátí aktuální kreditový zůstatek člena.

    Používá ho frontend při inicializaci (appInit) i po každé transakci
    pro zobrazení aktuálního stavu v hlavičce aplikace.
    """
    clen = db.get(Member, member_id)
    if not clen:
        raise HTTPException(status_code=404, detail="Člen nenalezen")

    return {
        "member_id": clen.member_id,
        "jmeno": f"{clen.name} {clen.surname}",
        "credit_balance": clen.credit_balance,
    }
