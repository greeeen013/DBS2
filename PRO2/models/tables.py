# Definice junction (vazebních) tabulek, které nemají vlastní ORM třídu.
#
# Junction tabulky jsou zde odděleny záměrně – zabráníme situaci,
# kdy by import jen Payment (bez Reservation) způsobil, že tabulka
# reservation_payment není v Base.metadata a mapper by selhal.
#
# Oba modely (Reservation, Payment) importují přímo Table objekt z tohoto modulu.

from sqlalchemy import Column, ForeignKey, Integer, Table

from .base import Base

# --- Vazební tabulka reservation_payment ---
# V DDL nemá tato tabulka primární klíč a oba FK sloupce jsou nullable.
# Nepoužíváme ORM třídu – slouží jako M:N bridge mezi Reservation a Payment.
reservation_payment_table = Table(
    "reservation_payment",
    Base.metadata,
    Column(
        "payment_id",
        Integer,
        ForeignKey("payment.payment_id", ondelete="NO ACTION"),
        nullable=True,  # Zachováváme nullable dle DDL.
    ),
    Column(
        "reservation_id",
        Integer,
        ForeignKey("reservation.reservation_id", ondelete="NO ACTION"),
        nullable=True,  # Zachováváme nullable dle DDL.
    ),
)
