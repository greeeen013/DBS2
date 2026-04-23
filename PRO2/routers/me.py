# Router pro self-service endpointy přihlášeného člena (IR04).
#
# Prefix /me – všechny endpointy zde vrací data patřící přihlášenému uživateli.
# Autentizace probíhá výhradně přes get_current_member (žádné member_id v URL).

import os
import shutil

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from auth.dependencies import CurrentUser, get_current_member
from db.dependencies import get_db
from models.member import Member
from models.payment import Payment
from models.reservation import Reservation
from schemas.history import MemberHistoryResponse

router = APIRouter(prefix="/me", tags=["Profil člena"])

PHOTOS_DIR = os.path.join(os.path.dirname(__file__), "..", "static", "photos")


@router.get("", tags=["Profil člena"])
def get_my_profile(
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_member),
):
    """Vrátí základní profil přihlášeného člena včetně URL fotky."""
    clen = db.get(Member, current.member_id)
    if not clen:
        raise HTTPException(status_code=404, detail="Člen nenalezen")
    return {
        "member_id": clen.member_id,
        "name": clen.name,
        "surname": clen.surname,
        "email": clen.email,
        "role": clen.role,
        "credit_balance": clen.credit_balance,
        "photo_url": clen.photo,
    }


@router.post("/photo", tags=["Profil člena"])
async def upload_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_member),
):
    """Nahraje profilovou fotku přihlášeného člena (JPEG nebo PNG, max 5 MB)."""
    if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(status_code=400, detail="Povolené formáty: JPEG, PNG, WebP")

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Fotka nesmí být větší než 5 MB")

    ext = "jpg" if file.content_type == "image/jpeg" else file.content_type.split("/")[1]
    filename = f"{current.member_id}.{ext}"
    filepath = os.path.join(PHOTOS_DIR, filename)

    os.makedirs(PHOTOS_DIR, exist_ok=True)
    with open(filepath, "wb") as f:
        f.write(content)

    photo_url = f"/static/photos/{filename}"
    clen = db.get(Member, current.member_id)
    clen.photo = photo_url
    db.commit()

    return {"photo_url": photo_url}


@router.get("/history", response_model=MemberHistoryResponse)
def moje_historie(
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_member),
):
    """
    Vrátí kombinovanou historii přihlášeného člena.

    Rezervace seřazeny dle timestamp_creation DESC, platby dle date DESC.
    Přístup má pouze přihlášený člen ke svým vlastním datům (určeno z JWT tokenu).
    """
    rezervace = (
        db.query(Reservation)
        .filter(Reservation.member_id == current.member_id)
        .order_by(Reservation.timestamp_creation.desc())
        .all()
    )

    platby = (
        db.query(Payment)
        .filter(Payment.member_id == current.member_id)
        .order_by(Payment.date.desc())
        .all()
    )

    return MemberHistoryResponse(reservations=rezervace, payments=platby)
