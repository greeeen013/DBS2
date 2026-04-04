# Schéma pro kombinovanou historii přihlášeného člena (IR04).
#
# Vrací dvě oddělená pole (ne polymorfní seznam) – zachovává typovou bezpečnost
# bez nutnosti discriminated union v Pydantic.

from typing import List

from pydantic import BaseModel

from schemas.payment import PaymentResponse
from schemas.reservation import ReservationResponse


class MemberHistoryResponse(BaseModel):
    """Kombinovaná historie přihlášeného člena – rezervace i platby."""

    reservations: List[ReservationResponse]
    payments: List[PaymentResponse]
