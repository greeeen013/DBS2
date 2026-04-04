# Router pro self-service endpointy přihlášeného člena (IR04).
#
# Prefix /me – všechny endpointy zde vrací data patřící přihlášenému uživateli.
# Autentizace probíhá výhradně přes get_current_member (žádné member_id v URL).

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import CurrentUser, get_current_member
from db.dependencies import get_db
from models.payment import Payment
from models.reservation import Reservation
from schemas.history import MemberHistoryResponse

router = APIRouter(prefix="/me", tags=["Profil člena"])


@router.get("/history", response_model=MemberHistoryResponse)
def moje_historie(
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_member),
):
    """
    Vrátí kombinovanou historii přihlášeného člena.

    Rezervace seřazeny dle timestamp_creation DESC, platby dle date DESC.
    Přístup má pouze přihlášený člen ke svým vlastním datům (určeno z JWT tokenu).
    """
    rezervace = (
        db.query(Reservation)
        .filter(Reservation.member_id == current.member_id)
        .order_by(Reservation.timestamp_creation.desc())
        .all()
    )

    platby = (
        db.query(Payment)
        .filter(Payment.member_id == current.member_id)
        .order_by(Payment.date.desc())
        .all()
    )

    return MemberHistoryResponse(reservations=rezervace, payments=platby)
