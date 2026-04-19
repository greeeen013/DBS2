# Router pro endpointy lekcí.
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.dependencies import get_db
from models.lesson import LessonSchedule
from models.reservation import Reservation
from schemas.lesson import (
    LessonCreate,
    LessonResponse,
    LessonDetailResponse,
    LessonStatusUpdate,
    LessonStatusResponse,
    AttendanceUpdate,
    AttendanceResponse,
    LessonAttendeeResponse,
)

router = APIRouter(prefix="/lessons", tags=["Lekce"])

@router.get("/", response_model=List[LessonResponse])
def get_lessons(db: Session = Depends(get_db)):
    """Načte seznam všech rozvrhnutých lekcí."""
    return db.query(LessonSchedule).all()

@router.get("/{lesson_id}", response_model=LessonDetailResponse)
def get_lesson_detail(lesson_id: int, db: Session = Depends(get_db)):
    """
    Vrátí detail jedné konkrétní lekce včetně počtu registrovaných.
    Potřebné pro UI trenéra (zjistit obsazenost, stav, čas lekce).
    """
    lesson = db.get(LessonSchedule, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lekce nenalezena")

    registered_count = db.query(Reservation).filter(
        Reservation.lesson_schedule_id == lesson_id,
        Reservation.status.in_(["CREATED", "CONFIRMED"])
    ).count()

    return LessonDetailResponse(
        lesson_schedule_id=lesson.lesson_schedule_id,
        name=lesson.name,
        description=lesson.description,
        duration=lesson.duration,
        start_time=lesson.start_time,
        end_time=lesson.end_time,
        maximum_capacity=lesson.maximum_capacity,
        status=lesson.status,
        price=lesson.price,
        is_private=lesson.is_private,
        employee_id=lesson.employee_id,
        lesson_template_id=lesson.lesson_template_id,
        lesson_type_id=lesson.lesson_type_id,
        registered_count=registered_count,
    )

@router.get("/{lesson_id}/attendees", response_model=List[LessonAttendeeResponse])
def get_lesson_attendees(lesson_id: int, db: Session = Depends(get_db)):
    """
    Vrátí seznam registrovaných členů na konkrétní lekci.
    Klíčový endpoint pro trenéra: zjistí, kdo je na lekci zapsán,
    jaký je stav rezervace a zda se člen zúčastnil (attendance).
    """
    lesson = db.get(LessonSchedule, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lekce nenalezena")

    reservations = db.query(Reservation).filter(
        Reservation.lesson_schedule_id == lesson_id
    ).all()

    return [
        LessonAttendeeResponse(
            reservation_id=r.reservation_id,
            member_id=r.member_id,
            status=r.status,
            attendance=r.attendance,
            guest_name=r.guest_name,
            note=r.note,
        )
        for r in reservations
    ]

@router.post("/", response_model=LessonResponse, status_code=status.HTTP_201_CREATED)
def create_lesson(data: LessonCreate, db: Session = Depends(get_db)):
    """Vytvoří novou lekci."""
    lesson = LessonSchedule(**data.model_dump())
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson

@router.patch("/{lesson_id}/status", response_model=LessonStatusResponse)
def update_lesson_status(lesson_id: int, data: LessonStatusUpdate, db: Session = Depends(get_db)):
    """Změní stav lekce."""
    lesson = db.get(LessonSchedule, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lekce nenalezena")
    
    # Validace stavového přechodu by sem mohla být přidána
    lesson.status = data.status.upper()
    db.commit()
    db.refresh(lesson)
    
    return {"lesson_schedule_id": lesson.lesson_schedule_id, "status": lesson.status}

@router.post("/{lesson_id}/attendance", response_model=AttendanceResponse)
def set_attendance(lesson_id: int, data: AttendanceUpdate, db: Session = Depends(get_db)):
    """
    Zapíše nebo upraví docházku člena na konkrétní lekci.
    Docházka je boolean atribut v záznamu Reservation.
    """
    lesson = db.get(LessonSchedule, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lekce nenalezena")
        
    # Validace - zápis docházky pouze u COMPLETED lekce? (zjednodušeno pro IR03 bez striktních blokací)
    
    # Najít validní rezervaci
    reservation = db.query(Reservation).filter(
        Reservation.lesson_schedule_id == lesson_id,
        Reservation.member_id == data.member_id
    ).first()
    
    if not reservation:
        raise HTTPException(status_code=404, detail="Rezervace nenalezena")
        
    reservation.attendance = data.attended
    db.commit()
    db.refresh(reservation)
    
    return {
        "reservation_id": reservation.reservation_id,
        "lesson_schedule_id": reservation.lesson_schedule_id,
        "member_id": reservation.member_id,
        "attendance": reservation.attendance
    }
