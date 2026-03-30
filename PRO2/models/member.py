# SQLAlchemy model pro tabulku 'member'.
#
# Pro potřeby IR03 implementuji jen sloupce nutné pro kreditovou logiku –
# kompletní model (adresa, kontaktní údaje, fotografie) doplním v dalších iteracích.
# Kredit je celé číslo: 300 CZK = 300 kreditů (dle požadavků provozovatele).
#
# Poznámka k FK v jiných modelech:
# Reservation.member_id a Payment.member_id odkazují na tuto tabulku.

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class Member(Base):
    """ORM mapování tabulky 'member' – člen MMA klubu Pretorian."""

    __tablename__ = "member"

    # --- Primární klíč ---
    member_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    # --- Jméno a příjmení ---
    # DDL (Enterprise Architect): "Name" a "Surname" → v DB uloženo bez uvozovek jako lowercase.
    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Křestní jméno člena.",
    )

    surname: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Příjmení člena.",
    )

    # --- Kreditový zůstatek ---
    # Celé číslo – 1 kredit = 1 CZK (300 CZK platba = 300 kreditů).
    # Výchozí hodnota 0 – nový člen nemá žádné kredity.
    credit_balance: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        comment="Aktuální zůstatek kreditů (1 kredit = 1 CZK).",
    )

    def __repr__(self) -> str:
        return (
            f"<Member(id={self.member_id}, "
            f"name='{self.name} {self.surname}', "
            f"kredity={self.credit_balance})>"
        )
