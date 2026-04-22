from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, SmallInteger
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class Membership(Base):
    __tablename__ = "membership"

    membership_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    creation_date: Mapped[date] = mapped_column(Date, nullable=False)
    is_auto_renewal: Mapped[bool | None] = mapped_column(Boolean, nullable=True, default=False)
    # DDL: timestamp without time zone – ukládáme jako naive UTC
    valid_from: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    valid_to: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    member_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("member.member_id", ondelete="NO ACTION"),
        nullable=False,
    )
    tariff_id: Mapped[int] = mapped_column(
        SmallInteger,
        ForeignKey("tariff.tariff_id", ondelete="NO ACTION"),
        nullable=False,
    )

    def __repr__(self) -> str:
        return (
            f"<Membership(id={self.membership_id}, "
            f"member={self.member_id}, "
            f"tariff={self.tariff_id}, "
            f"valid_to={self.valid_to})>"
        )
