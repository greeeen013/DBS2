from datetime import datetime
from typing import Optional
from pydantic import BaseModel

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
    lesson_type_id: int

class LessonCreate(LessonBase):
    pass

class LessonResponse(LessonBase):
    lesson_schedule_id: int

    class Config:
        orm_mode = True
        from_attributes = True

class LessonStatusUpdate(BaseModel):
    status: str

class LessonStatusResponse(BaseModel):
    lesson_schedule_id: int
    status: str

class AttendanceUpdate(BaseModel):
    member_id: int
    attended: bool

class AttendanceResponse(BaseModel):
    reservation_id: int
    lesson_schedule_id: int
    member_id: int
    attendance: bool
