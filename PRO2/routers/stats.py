from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from auth.dependencies import CurrentUser, get_current_member
from db.dependencies import get_db

router = APIRouter(prefix="/stats", tags=["Statistiky"])


class ScheduleCapacityItem(BaseModel):
    lesson_schedule_id: int
    lesson_name: str
    start_time: datetime
    maximum_capacity: int
    occupied_slots: int
    free_slots: int


class MemberNoMembershipItem(BaseModel):
    member_id: int
    name: str
    surname: str
    email: Optional[str]
    credit_balance: int
    last_membership_expiry: Optional[datetime]


class TrainerStatsItem(BaseModel):
    employee_id: int
    name: str
    surname: str
    total_lessons: int
    total_reservations: int
    attended_count: int


@router.get("/schedule-capacity", response_model=List[ScheduleCapacityItem])
def get_schedule_capacity(db: Session = Depends(get_db)):
    """Rozvrh lekcí s počtem volných míst (z pohledu v_schedule_with_capacity)."""
    rows = db.execute(
        text("SELECT * FROM v_schedule_with_capacity ORDER BY start_time")
    ).mappings().all()
    return [dict(r) for r in rows]


@router.get("/members-no-membership", response_model=List[MemberNoMembershipItem])
def get_members_no_membership(
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_member),
):
    """Členové bez aktivní permanentky (z pohledu v_members_no_active_membership). Pouze admin."""
    if current.role != "admin":
        raise HTTPException(status_code=403, detail="Přístup pouze pro administrátora")
    rows = db.execute(
        text("SELECT * FROM v_members_no_active_membership")
    ).mappings().all()
    return [dict(r) for r in rows]


@router.get("/trainer-stats", response_model=List[TrainerStatsItem])
def get_trainer_stats(
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_member),
):
    """Statistiky trenérů – počty lekcí a rezervací (z pohledu v_trainer_stats). Admin nebo trenér."""
    if current.role not in ("admin", "trainer"):
        raise HTTPException(status_code=403, detail="Přístup pouze pro admina nebo trenéra")
    rows = db.execute(
        text("SELECT * FROM v_trainer_stats ORDER BY total_lessons DESC")
    ).mappings().all()
    return [dict(r) for r in rows]
