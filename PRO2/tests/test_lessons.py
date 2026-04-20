# Testy pro nové endpointy detailu lekce a seznamu účastníků.
#
# Testují:
#   GET /lessons/{lesson_id}           → vrátí detail lekce + registered_count
#   GET /lessons/{lesson_id}/attendees → vrátí seznam rezervací pro trenéra
#
# Proč tyto testy: Trenér musí být schopen zjistit, kdo je na lekci zapsán,
# bez nutnosti volat /reservations/ a filtrovat. Tyto endpointy to zpřístupňují.

import pytest


# ---------------------------------------------------------------------------
# Pomocné factory funkce – vloží testovací data přímo do DB
# ---------------------------------------------------------------------------

def vytvor_lekci(db, name="Testovací lekce", status="OPEN"):
    """Vloží lekci přímo do DB, vrátí lesson_schedule_id."""
    from models.lesson import LessonSchedule, Employee, LessonType
    from datetime import datetime

    # Minimální závislosti – employee + lesson_type musí existovat
    emp = Employee(employee_id=1)
    lt = LessonType(lesson_type_id=1)
    db.add(emp)
    db.add(lt)
    db.flush()

    lekce = LessonSchedule(
        name=name,
        duration=60,
        start_time=datetime(2026, 6, 1, 10, 0),
        maximum_capacity=20,
        status=status,
        employee_id=1,
        lesson_type_id=1,
    )
    db.add(lekce)
    db.commit()
    db.refresh(lekce)
    return lekce.lesson_schedule_id


def vytvor_rezervaci(db, lesson_id, member_id, status="CREATED", attendance=None):
    """Vloží rezervaci přímo do DB."""
    from models.reservation import Reservation

    rezervace = Reservation(
        lesson_schedule_id=lesson_id,
        member_id=member_id,
        status=status,
        attendance=attendance,
    )
    db.add(rezervace)
    db.commit()
    db.refresh(rezervace)
    return rezervace.reservation_id


def vytvor_clena(db, name="Test", surname="Člen", balance=100):
    """Vloží člena do DB, vrátí member_id."""
    from models.member import Member

    clen = Member(name=name, surname=surname, credit_balance=balance)
    db.add(clen)
    db.commit()
    db.refresh(clen)
    return clen.member_id


# ---------------------------------------------------------------------------
# GET /lessons/{lesson_id} – detail lekce
# ---------------------------------------------------------------------------

class TestLessonDetail:

    def test_detail_existujici_lekce(self, client, setup_db):
        """Detail existující lekce vrátí správná data včetně registered_count."""
        from tests.conftest import TestingSessionLocal

        db = TestingSessionLocal()
        lesson_id = vytvor_lekci(db, name="Kickbox Pokročilí", status="OPEN")
        clen1 = vytvor_clena(db, "Pavel", "Novák")
        clen2 = vytvor_clena(db, "Jana", "Malá")
        vytvor_rezervaci(db, lesson_id, clen1, status="CONFIRMED")
        vytvor_rezervaci(db, lesson_id, clen2, status="CREATED")
        db.close()

        response = client.get(f"/lessons/{lesson_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["lesson_schedule_id"] == lesson_id
        assert data["name"] == "Kickbox Pokročilí"
        assert data["status"] == "OPEN"
        assert data["maximum_capacity"] == 20
        # registered_count zahrnuje CREATED a CONFIRMED rezervace
        assert data["registered_count"] == 2

    def test_detail_lekce_bez_rezervaci(self, client, setup_db):
        """Lekce bez rezervací má registered_count == 0."""
        from tests.conftest import TestingSessionLocal

        db = TestingSessionLocal()
        lesson_id = vytvor_lekci(db, name="Prázdná lekce")
        db.close()

        response = client.get(f"/lessons/{lesson_id}")

        assert response.status_code == 200
        assert response.json()["registered_count"] == 0

    def test_detail_neznamou_lekci_vraci_404(self, client, setup_db):
        """Detail neexistující lekce vrátí 404."""
        response = client.get("/lessons/99999")

        assert response.status_code == 404
        assert "nenalezena" in response.json()["detail"].lower()

    def test_detail_nezapocitava_storno_rezervace(self, client, setup_db):
        """Zrušené rezervace (CANCELLED) nesmí být zahrnuty do registered_count."""
        from tests.conftest import TestingSessionLocal

        db = TestingSessionLocal()
        lesson_id = vytvor_lekci(db)
        clen_a = vytvor_clena(db, "Aktivní", "Člen")
        clen_b = vytvor_clena(db, "Storno", "Člen")
        vytvor_rezervaci(db, lesson_id, clen_a, status="CONFIRMED")
        vytvor_rezervaci(db, lesson_id, clen_b, status="CANCELLED")  # nesmí se počítat
        db.close()

        response = client.get(f"/lessons/{lesson_id}")

        assert response.status_code == 200
        assert response.json()["registered_count"] == 1  # jen CONFIRMED


# ---------------------------------------------------------------------------
# GET /lessons/{lesson_id}/attendees – seznam účastníků
# ---------------------------------------------------------------------------

class TestLessonAttendees:

    def test_seznam_ucastniku_prazdna_lekce(self, client, setup_db):
        """Lekce bez rezervací vrátí prázdný seznam."""
        from tests.conftest import TestingSessionLocal

        db = TestingSessionLocal()
        lesson_id = vytvor_lekci(db)
        db.close()

        response = client.get(f"/lessons/{lesson_id}/attendees")

        assert response.status_code == 200
        assert response.json() == []

    def test_seznam_ucastniku_obsahuje_vsechny_rezervace(self, client, setup_db):
        """Endpoint vrátí všechny rezervace (i CANCELLED) – trenér má úplný přehled."""
        from tests.conftest import TestingSessionLocal

        db = TestingSessionLocal()
        lesson_id = vytvor_lekci(db)
        clen1 = vytvor_clena(db, "Aleš", "Dvořák")
        clen2 = vytvor_clena(db, "Petra", "Nováková")
        vytvor_rezervaci(db, lesson_id, clen1, status="CONFIRMED", attendance=True)
        vytvor_rezervaci(db, lesson_id, clen2, status="CANCELLED")
        db.close()

        response = client.get(f"/lessons/{lesson_id}/attendees")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2

    def test_attendee_obsahuje_spravna_pole(self, client, setup_db):
        """Každý záznam v attendees má member_id, status a attendance."""
        from tests.conftest import TestingSessionLocal

        db = TestingSessionLocal()
        lesson_id = vytvor_lekci(db)
        clen = vytvor_clena(db, "Tomáš", "Kratochvíl")
        vytvor_rezervaci(db, lesson_id, clen, status="CONFIRMED", attendance=True)
        db.close()

        response = client.get(f"/lessons/{lesson_id}/attendees")

        assert response.status_code == 200
        attendee = response.json()[0]
        assert "reservation_id" in attendee
        assert "member_id" in attendee
        assert attendee["member_id"] == clen
        assert attendee["status"] == "CONFIRMED"
        assert attendee["attendance"] is True

    def test_attendees_pro_neexistujici_lekci_vraci_404(self, client, setup_db):
        """Attendees pro neexistující lekci vrátí 404."""
        response = client.get("/lessons/99999/attendees")

        assert response.status_code == 404

# ---------------------------------------------------------------------------
# POST /lessons/{lesson_id}/team-attendance – hromadná docházka
# ---------------------------------------------------------------------------

class TestBulkAttendance:

    def test_bulk_attendance_success(self, client, setup_db):
        """Úspěšné uložení docházky pro dva členy najednou."""
        from tests.conftest import TestingSessionLocal
        db = TestingSessionLocal()
        
        lesson_id = vytvor_lekci(db, status="COMPLETED")
        clen1 = vytvor_clena(db, "Ivan", "Hrozný")
        clen2 = vytvor_clena(db, "Petr", "Veliký")
        vytvor_rezervaci(db, lesson_id, clen1, status="CONFIRMED")
        vytvor_rezervaci(db, lesson_id, clen2, status="CONFIRMED")
        db.close()

        payload = {
            "members": [
                {"member_id": clen1, "attended": True},
                {"member_id": clen2, "attended": False}
            ]
        }

        response = client.post(f"/lessons/{lesson_id}/team-attendance", json=payload)

        assert response.status_code == 200
        data = response.json()
        assert data["updated_count"] == 2
        assert "úspěšně uložena" in data["message"]

        # Ověření v DB
        db = TestingSessionLocal()
        from models.reservation import Reservation
        res1 = db.query(Reservation).filter_by(member_id=clen1, lesson_schedule_id=lesson_id).one()
        res2 = db.query(Reservation).filter_by(member_id=clen2, lesson_schedule_id=lesson_id).one()
        assert res1.attendance is True
        assert res2.attendance is False
        db.close()

    def test_bulk_attendance_nonexistent_lesson(self, client, setup_db):
        """Pokus o uložení docházky u neexistující lekce vrátí 404."""
        payload = {"members": []}
        response = client.post("/lessons/99999/team-attendance", json=payload)
        assert response.status_code == 404
