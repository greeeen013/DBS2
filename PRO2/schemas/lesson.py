from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class TrainerResponse(BaseModel):
    employee_id: int
    name: str
    surname: str

    class Config:
        from_attributes = True


class LessonTemplateResponse(BaseModel):
    lesson_template_id: int
    name: str
    description: Optional[str] = None
    duration: int
    maximum_capacity: int
    price: float
    lesson_type_id: int

    class Config:
        from_attributes = True


class LessonBase(BaseModel):
    name: str
    description: Optional[str] = None
    duration: int
    start_time: datetime
    end_time: Optional[datetime] = None
    maximum_capacity: int
    status: str = "OPEN"
    price: Optional[float] = None
    is_private: Optional[bool] = None
    employee_id: int
    lesson_template_id: Optional[int] = None
    lesson_type_id: int = 1

class LessonCreate(LessonBase):
    pass

class LessonResponse(LessonBase):
    lesson_schedule_id: int
    registered_count: int = 0

    class Config:
        orm_mode = True
        from_attributes = True

class LessonDetailResponse(LessonBase):
    lesson_schedule_id: int
    registered_count: int = 0
    trainer_name: Optional[str] = None

    class Config:
        orm_mode = True
        from_attributes = True

class LessonStatusUpdate(BaseModel):
    status: str

class LessonStatusResponse(BaseModel):
    lesson_schedule_id: int
    status: str

class LessonAttendeeResponse(BaseModel):
    """
    Jeden účastník lekce – odpověď endpointu GET /lessons/{id}/attendees.
    Obsahuje member_id, stav rezervace a přítomnost (attendance).
    Trenér pomocí tohoto schématu zjistí přesně kdo je zapsán
    a zda se daný člen lekce fyzicky zúčastnil.
    """
    reservation_id: int
    member_id: int
    member_name: Optional[str] = None
    member_surname: Optional[str] = None
    status: str
    attendance: Optional[bool] = None
    guest_name: Optional[str] = None
    note: Optional[str] = None

    class Config:
        orm_mode = True
        from_attributes = True


class LessonTypeResponse(BaseModel):
    lesson_type_id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class AttendanceUpdate(BaseModel):
    member_id: int
    attended: bool

class AttendanceResponse(BaseModel):
    reservation_id: int
    lesson_schedule_id: int
    member_id: int
    attendance: bool

class TeamAttendanceRecord(BaseModel):
    """Jeden záznam v hromadném uložení docházky."""
    member_id: int
    attended: bool

class TeamAttendanceUpdate(BaseModel):
    """Požadavek na uložení docházky pro více členů najednou."""
    members: list[TeamAttendanceRecord]

class TeamAttendanceResponse(BaseModel):
    """Souhrnná odpověď po hromadném uložení docházky."""
    lesson_schedule_id: int
    updated_count: int
    message: str
