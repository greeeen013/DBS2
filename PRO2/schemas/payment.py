# Pydantic schémata pro endpointy plateb.
#
# Platba v systému prochází stavovým automatem:
#   PENDING -> COMPLETED (přidá kredity na účet)
#   PENDING -> FAILED    (žádná změna kreditů)
#   COMPLETED -> REFUNDED (odebere kredity)

from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class PaymentCreate(BaseModel):
    """Data potřebná pro vytvoření nové platby (POST /payments/)."""

    amount: Decimal          # Výše platby v CZK (= počet kreditů, které se přidají po COMPLETED)
    payment_type: str        # Způsob platby: CREDIT, CARD, CASH, TRANSFER
    member_id: int           # Člen, jehož účet bude připsán
    membership_id: Optional[int] = None  # Volitelně – ke které permanentce se platba váže


class PaymentStatusUpdate(BaseModel):
    """Požadavek na změnu stavu platby (PATCH /payments/{id}/status)."""

    status: str  # Povolené hodnoty: COMPLETED, FAILED, REFUNDED


class PaymentResponse(BaseModel):
    """Odpověď API pro jednu platbu."""

    payment_id: int
    amount: Optional[Decimal] = None
    status: Optional[str] = None
    payment_type: Optional[str] = None
    member_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
