from decimal import Decimal

from sqlalchemy import Integer, Numeric, SmallInteger, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class Tariff(Base):
    __tablename__ = "tariff"

    tariff_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    duration_months: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=1)
    duration_days: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=0)

    def __repr__(self) -> str:
        return f"<Tariff(id={self.tariff_id}, name='{self.name}', price={self.price})>"
