from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

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

    # Note: Reservations are linked by reservation.lesson_schedule_id, but the relation 
    # could be added here if needed.
    reservations: Mapped[list["Reservation"]] = relationship(
        "Reservation", 
        backref="lesson"
    )

    def __repr__(self) -> str:
        return f"<LessonSchedule(id={self.lesson_schedule_id}, name='{self.name}', status='{self.status}')>"
