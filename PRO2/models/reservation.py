# SQLAlchemy model pro tabulku 'reservation'.
#
# Rezervace je jádro business logiky Studenta A – reprezentuje vztah mezi
# konkrétním členem (member) a naplánovanou lekcí (lesson_schedule).
# Stavový automat rezervace:  CREATED -> CONFIRMED -> ATTENDED
#                              CREATED -> CANCELLED
#                              CONFIRMED -> CANCELLED
#
# Sloupce odpovídají DDL.sql vygenerovanému z Enterprise Architectu.

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class Reservation(Base):
    """ORM mapování tabulky 'reservation' z databáze mma_club_db."""

    __tablename__ = "reservation"

    # --- Primární klíč ---
    # Automaticky generovaný integer – odpovídá sekvenci reservation_reservation_id_seq v DB.
    reservation_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    # --- Stav rezervace (stavový automat) ---
    # Povolené hodnoty: CREATED, CONFIRMED, CANCELLED, ATTENDED
    # NOT NULL – každá rezervace musí mít stav od okamžiku vzniku.
    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="CREATED",
        comment="Aktuální stav rezervace v rámci stavového automatu.",
    )

    # --- Časové razítko vytvoření ---
    # Serverový čas vložení, ukládáme jako aware-free datetime (timezone=False dle DDL).
    timestamp_creation: Mapped[datetime] = mapped_column(
        DateTime(timezone=False),
        nullable=False,
        default=datetime.utcnow,
        comment="Čas vzniku rezervace (UTC).",
    )

    # --- Časové razítko poslední změny stavu ---
    # Nullable – při vytvoření je NULL, vyplní se při každé změně stavu.
    timestamp_change: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=False),
        nullable=True,
        comment="Čas poslední změny stavu rezervace.",
    )

    # --- Přítomnost na lekci ---
    # TRUE = člen se lekce fyzicky zúčastnil (přechod do stavu ATTENDED).
    attendance: Mapped[bool | None] = mapped_column(
        Boolean,
        nullable=True,
        comment="Zda se člen fyzicky zúčastnil lekce.",
    )

    # --- Jméno hosta ---
    # Nepovinné – pro případ, kdy rezervaci vytváří člen pro cizí osobu.
    guest_name: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
        comment="Jméno hosta, pokud rezervace není pro samotného člena.",
    )

    # --- Poznámka ---
    note: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        comment="Volitelná poznámka k rezervaci.",
    )

    # --- Cizí klíče ---
    # FK na tabulku 'member' – každá rezervace patří jednomu členovi.
    member_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("member.member_id", ondelete="NO ACTION"),
        nullable=False,
        comment="ID člena, který rezervaci provedl.",
    )

    # FK na tabulku 'lesson_schedule' – konkrétní naplánovaná lekce.
    lesson_schedule_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("lesson_schedule.lesson_schedule_id", ondelete="NO ACTION"),
        nullable=False,
        comment="ID naplánované lekce, na kterou se rezervace vztahuje.",
    )

    # --- Vztahy (relationships) ---
    # Přístup k propojeným platbám přes vazební tabulku reservation_payment.
    # Lazy loading – SQLAlchemy dotáhne platby až při prvním přístupu k atributu.
    payments: Mapped[list["ReservationPayment"]] = relationship(
        "ReservationPayment",
        back_populates="reservation",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return (
            f"<Reservation(id={self.reservation_id}, "
            f"member={self.member_id}, "
            f"lesson={self.lesson_schedule_id}, "
            f"status='{self.status}')>"
        )


class ReservationPayment(Base):
    """Vazební tabulka 'reservation_payment' – propojení rezervace a platby.

    Vztah M:N mezi Reservation a Payment.
    Model je zde, protože jeho životní cyklus řídí Student A (owner entity Reservation).
    """

    __tablename__ = "reservation_payment"

    # Kompozitní primární klíč není v DDL explicitně definován,
    # tabulka má pouze dva nullable FK sloupce – zachováváme strukturu dle DDL.
    payment_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("payment.payment_id", ondelete="NO ACTION"),
        nullable=True,
        primary_key=True,
    )
    reservation_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("reservation.reservation_id", ondelete="NO ACTION"),
        nullable=True,
        primary_key=True,
    )

    # Zpětné vztahy
    reservation: Mapped["Reservation"] = relationship(
        "Reservation",
        back_populates="payments",
    )
    payment: Mapped["Payment"] = relationship(
        "Payment",
        back_populates="reservations",
    )


# Import Payment musí být na konci, aby nedošlo ke kruhovému importu.
from .payment import Payment  # noqa: E402
