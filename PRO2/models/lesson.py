from datetime import datetime
from typing import Optional
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Numeric, String, Table, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

# Junction: which tariffs are required for a lesson_schedule
lesson_tariff = Table(
    "lesson_tariff",
    Base.metadata,
    Column("lesson_schedule_id", Integer, ForeignKey("lesson_schedule.lesson_schedule_id", ondelete="CASCADE"), primary_key=True),
    Column("tariff_id", Integer, ForeignKey("tariff.tariff_id", ondelete="CASCADE"), primary_key=True),
)

# Junction: which tariffs are associated with a lesson template (preset)
lesson_template_tariff = Table(
    "lesson_template_tariff",
    Base.metadata,
    Column("lesson_template_id", Integer, ForeignKey("lesson_template.lesson_template_id", ondelete="CASCADE"), primary_key=True),
    Column("tariff_id", Integer, ForeignKey("tariff.tariff_id", ondelete="CASCADE"), primary_key=True),
)

class Employee(Base):
    __tablename__ = "employee"
    employee_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    bank_account_number: Mapped[str] = mapped_column(String(34), nullable=False, default="")
    position: Mapped[str] = mapped_column(String(200), nullable=False, default="Trenér")
    role: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    start_date: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    type_of_empoyment: Mapped[str] = mapped_column(String(50), nullable=False, default="HPP")

class LessonType(Base):
    __tablename__ = "lesson_type"
    lesson_type_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

class LessonTemplate(Base):
    __tablename__ = "lesson_template"
    lesson_template_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    duration: Mapped[int] = mapped_column(Integer, nullable=False)
    maximum_capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    lesson_type_id: Mapped[int] = mapped_column(Integer, nullable=False)

    allowed_tariffs = relationship("Tariff", secondary=lesson_template_tariff, lazy="selectin")

class LessonSchedule(Base):
    """ORM mapování tabulky 'Lesson_schedule'."""
    __tablename__ = "lesson_schedule"

    lesson_schedule_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    duration: Mapped[int] = mapped_column(Integer, nullable=False)
    start_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    maximum_capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="OPEN")
    price: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    is_private: Mapped[bool | None] = mapped_column(Boolean, nullable=True)

    employee_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("employee.employee_id", ondelete="NO ACTION"), nullable=False
    )
    lesson_template_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("lesson_template.lesson_template_id", ondelete="NO ACTION"), nullable=True
    )
    lesson_type_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("lesson_type.lesson_type_id", ondelete="NO ACTION"), nullable=False
    )

    reservations: Mapped[list["Reservation"]] = relationship("Reservation", backref="lesson")
    allowed_tariffs = relationship("Tariff", secondary=lesson_tariff, lazy="selectin")

    def __repr__(self) -> str:
        return f"<LessonSchedule(id={self.lesson_schedule_id}, name='{self.name}', status='{self.status}')>"
