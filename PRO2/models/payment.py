# SQLAlchemy model pro tabulku 'payment'.
#
# Platba je finanční záznam – může být navázána na členství (membership)
# nebo na rezervaci (přes vazební tabulku reservation_payment).
# Stavový automat platby: PENDING -> COMPLETED
#                         PENDING -> FAILED
#                         COMPLETED -> REFUNDED
#
# Volitelný sloupec 'payment_details' (text v DDL) slouží pro metadata platby –
# např. ID transakce z platební brány, JSON s rozpisem slev apod.
#
# Vazební tabulka reservation_payment je definována v reservation.py jako Table objekt
# (bez ORM třídy) – tím zachováváme soulad se schématem DDL, které nemá PK na té tabulce.

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class Payment(Base):
    """ORM mapování tabulky 'payment' z databáze mma_club_db."""

    __tablename__ = "payment"

    # --- Primární klíč ---
    payment_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    # --- Výše platby ---
    # Numeric(10, 2) – přesná desetinná arithmetika, žádné zaokrouhlovací chyby.
    # Nullable dle DDL (amount může být doplněna dodatečně).
    amount: Mapped[float | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
        comment="Výše platby v korunách.",
    )

    # --- Datum a čas platby ---
    # timezone=True – DDL definuje 'timestamp with time zone'.
    date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        default=datetime.utcnow,
        comment="Datum a čas provedení platby.",
    )

    # --- Typ platby ---
    # Příklady hodnot: 'CREDIT', 'CARD', 'CASH', 'TRANSFER'
    payment_type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        comment="Způsob platby (kredit, karta, hotovost, ...).",
    )

    # --- Stav platby (stavový automat) ---
    # Povolené hodnoty: PENDING, COMPLETED, REFUNDED, FAILED
    status: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        default="PENDING",
        comment="Aktuální stav platby v rámci stavového automatu.",
    )

    # --- Metadata platby ---
    # Text pole pro JSON nebo jiný popis platebních detailů (dle DDL je to text, ne jsonb).
    # Uchovává např. ID transakce třetí strany nebo rozepis slev.
    payment_details: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        comment="Volitelná textová metadata k platbě (JSON string, ID transakce atd.).",
    )

    # --- Cizí klíče ---
    # FK na členský slevový kód (nepovinný – platba nemusí mít slevu).
    discount_code_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("discount_code.discount_code_id", ondelete="NO ACTION"),
        nullable=True,
        comment="ID slevového kódu uplatněného při platbě.",
    )

    # FK na člena – kdo platbu provedl (nepovinný dle DDL, ale v praxi vždy vyplněn).
    member_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("member.member_id", ondelete="NO ACTION"),
        nullable=True,
        comment="ID člena, který platbu provedl.",
    )

    # FK na členství – platba za permanentku/tarif (nepovinný, FK na membership).
    membership_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("membership.membership_id", ondelete="NO ACTION"),
        nullable=True,
        comment="ID členství, ke kterému se platba váže (permanentka/tarif).",
    )

    # --- Vztah k rezervacím přes junction tabulku ---
    # secondary=reservation_payment_table – Table objekt bez vlastního ORM modelu.
    # Tím zachováváme schéma DDL (žádný PK na junction tabulce).
    reservations: Mapped[list["Reservation"]] = relationship(
        "Reservation",
        secondary="reservation_payment",  # SQLAlchemy si tabulku dohledá z metadat
        back_populates="payments",
    )

    def __repr__(self) -> str:
        return (
            f"<Payment(id={self.payment_id}, "
            f"amount={self.amount}, "
            f"status='{self.status}', "
            f"member={self.member_id})>"
        )

