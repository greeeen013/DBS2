# Router pro endpointy plateb.
#
# Platba slouží k dobití kreditů na účet člena.
# Po dokončení platby (COMPLETED) se amount CZK přepočítá na kredity
# a přičte k credit_balance člena (1 CZK = 1 kredit).
# Refundace (REFUNDED) kredity zpět odebere.

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.dependencies import CurrentUser, get_current_member, require_admin
from db.dependencies import get_db
from models.member import Member
from models.payment import Payment
from schemas.payment import PaymentCreate, PaymentResponse, PaymentStatusUpdate

router = APIRouter(prefix="/payments", tags=["Platby"])

# Povolené přechody stavového automatu platby.
POVOLENE_PRECHODY: dict[str, list[str]] = {
    "PENDING": ["COMPLETED", "FAILED"],
    "COMPLETED": ["REFUNDED"],
    "FAILED": [],
    "REFUNDED": [],
}


@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def vytvor_platbu(
    data: PaymentCreate,
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_member),
):
    """
    Vytvoří novou platbu ve stavu PENDING.

    Kredity se přičítají až po potvrzení platby (COMPLETED),
    ne při jejím vytvoření – kvůli možnému selhání transakce.
    """
    if current.role != "admin" and current.member_id != data.member_id:
        raise HTTPException(status_code=403, detail="Přístup zamítnut")

    nova_platba = Payment(
        amount=data.amount,
        payment_type=data.payment_type,
        member_id=data.member_id,
        membership_id=data.membership_id,
        status="PENDING",
        date=datetime.now(timezone.utc),
    )
    db.add(nova_platba)
    db.commit()
    db.refresh(nova_platba)
    return nova_platba


@router.get("/member/{member_id}", response_model=list[PaymentResponse])
def platby_clena(
    member_id: int,
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_member),
):
    """Vrátí historii plateb pro daného člena, seřazenou od nejnovější."""
    if current.role != "admin" and current.member_id != member_id:
        raise HTTPException(status_code=403, detail="Přístup zamítnut")
    return (
        db.query(Payment)
        .filter(Payment.member_id == member_id)
        .order_by(Payment.date.desc())
        .all()
    )


@router.patch("/{platba_id}/status", response_model=PaymentResponse)
def zmen_stav_platby(
    platba_id: int,
    data: PaymentStatusUpdate,
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_member),
):
    """
    Změní stav platby a provede odpovídající kreditovou operaci.

    - COMPLETED: přičte amount jako kredity na účet člena
    - FAILED: bez kreditové operace
    - REFUNDED: odečte amount kreditů z účtu člena
    """
    platba = db.get(Payment, platba_id)
    if not platba:
        raise HTTPException(status_code=404, detail="Platba nenalezena")

    if current.role != "admin" and current.member_id != platba.member_id:
        raise HTTPException(status_code=403, detail="Přístup zamítnut")

    novy_stav = data.status.upper()

    # Přechod do COMPLETED smí provést jen admin (platební operátor).
    # Člen nesmí sám sobě schvalovat platby a tím získávat neomezené kredity.
    if novy_stav == "COMPLETED" and current.role != "admin":
        raise HTTPException(status_code=403, detail="Schválení platby vyžaduje roli admin")
    povolene = POVOLENE_PRECHODY.get(platba.status, [])

    if novy_stav not in povolene:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Přechod ze stavu '{platba.status}' do '{novy_stav}' není povolen. "
                f"Povolené přechody: {povolene}"
            ),
        )

    # Dokončení platby – přičtení kreditů
    if novy_stav == "COMPLETED" and platba.member_id and platba.amount:
        clen = db.get(Member, platba.member_id)
        if clen:
            clen.credit_balance += int(platba.amount)

    # Refundace – odebrání kreditů
    elif novy_stav == "REFUNDED" and platba.member_id and platba.amount:
        clen = db.get(Member, platba.member_id)
        if clen:
            clen.credit_balance -= int(platba.amount)

    platba.status = novy_stav
    db.commit()
    db.refresh(platba)
    return platba
