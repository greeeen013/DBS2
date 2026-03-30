# Pydantic schémata pro endpointy rezervací.
#
# Oddělení ORM modelů (SQLAlchemy) od API schémat (Pydantic) je záměrné –
# ORM model odráží strukturu DB, schéma odráží kontrakt API (co přijme / vrátí).
# Díky tomu mohu měnit DB schéma bez zásahu do API kontraktu a naopak.

from typing import Optional

from pydantic import BaseModel, ConfigDict


class ReservationCreate(BaseModel):
    """Data potřebná pro vytvoření nové rezervace (POST /reservations/)."""

    member_id: int
    lesson_schedule_id: int
    note: Optional[str] = None
    guest_name: Optional[str] = None


class ReservationStatusUpdate(BaseModel):
    """Požadavek na změnu stavu rezervace (PATCH /reservations/{id}/status)."""

    status: str  # Povolené hodnoty: CONFIRMED, CANCELLED, ATTENDED


class ReservationResponse(BaseModel):
    """Odpověď API pro jednu rezervaci – serializuje ORM objekt."""

    reservation_id: int
    status: str
    member_id: int
    lesson_schedule_id: int
    note: Optional[str] = None
    guest_name: Optional[str] = None

    # from_attributes=True umožňuje číst hodnoty přímo z ORM objektu (ne jen z dict).
    model_config = ConfigDict(from_attributes=True)


class ReservationStatusResponse(BaseModel):
    """
    Rozšířená odpověď po změně stavu rezervace.

    Vedle aktualizované rezervace vrací i nový zůstatek kreditů,
    aby frontend nemusel dělat druhý dotaz na /members/{id}/balance.
    """

    reservation_id: int
    status: str
    member_id: int
    lesson_schedule_id: int
    credit_balance: Optional[int] = None  # Aktuální zůstatek po provedené operaci.
