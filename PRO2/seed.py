#!/usr/bin/env python3
"""
seed.py — vloží testovací data do databáze MMA klubu Pretorian.

Spuštění:
  cd PRO2
  python seed.py

Heslo pro všechny testovací účty: Heslo123

Vytvoří:
  - 2 typy lekcí (MMA, Kickbox)
  - 3 šablony lekcí
  - 1 admin, 2 trenéři, 3 členi
  - záznamy v tabulce employee pro trenéry a admina
  - 4 plánované lekce
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

import bcrypt
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from db.session import engine, SessionLocal
from models.base import Base
from models.member import Member
from models.lesson import Employee, LessonType, LessonTemplate, LessonSchedule


TEST_PASSWORD = "Heslo123"


def hash_pw(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def seed(db: Session):
    print("🌱 Vkládám testovací data...\n")

    # --- Typy lekcí ---
    types_data = [
        LessonType(name="MMA", description="Smíšená bojová umění – kombinace úderů, kopů a wrestlingu."),
        LessonType(name="Kickbox", description="Kontaktní sport kombinující box a kopání."),
        LessonType(name="BJJ", description="Brazilské jiu-jitsu – zápasnický styl zaměřený na techniku."),
    ]

    existing_types = db.query(LessonType).count()
    if existing_types == 0:
        for lt in types_data:
            db.add(lt)
        db.flush()
        print(f"  ✅ Přidáno {len(types_data)} typů lekcí")
    else:
        types_data = db.query(LessonType).all()
        print(f"  ⏭  Typy lekcí již existují ({existing_types} záznamů)")

    # --- Šablony lekcí ---
    templates_data = [
        LessonTemplate(
            name="MMA začátečníci",
            description="Lekce pro začátečníky – základy stoje, pádu a obrany.",
            duration=60,
            maximum_capacity=15,
            price=250.00,
            lesson_type_id=types_data[0].lesson_type_id,
        ),
        LessonTemplate(
            name="Kickbox pokročilí",
            description="Intenzivní trénink kopů a kombinací pro pokročilé.",
            duration=90,
            maximum_capacity=12,
            price=300.00,
            lesson_type_id=types_data[1].lesson_type_id,
        ),
        LessonTemplate(
            name="BJJ – technika na zemi",
            description="Zaměřeno na submisní techniky a přechody poloh.",
            duration=75,
            maximum_capacity=10,
            price=280.00,
            lesson_type_id=types_data[2].lesson_type_id,
        ),
    ]

    existing_templates = db.query(LessonTemplate).count()
    if existing_templates == 0:
        for tmpl in templates_data:
            db.add(tmpl)
        db.flush()
        print(f"  ✅ Přidáno {len(templates_data)} šablon lekcí")
    else:
        templates_data = db.query(LessonTemplate).all()
        print(f"  ⏭  Šablony již existují ({existing_templates} záznamů)")

    # --- Členové ---
    members_raw = [
        dict(name="Adam",  surname="Novák",    email="admin@pretorian.cz",    role="admin",   credit_balance=0),
        dict(name="Tomáš", surname="Kovář",    email="trener1@pretorian.cz",  role="trainer", credit_balance=0),
        dict(name="Jana",  surname="Horáková", email="trener2@pretorian.cz",  role="trainer", credit_balance=0),
        dict(name="Petr",  surname="Svoboda",  email="clen1@pretorian.cz",    role="member",  credit_balance=500),
        dict(name="Lucie", surname="Marková",  email="clen2@pretorian.cz",    role="member",  credit_balance=300),
        dict(name="Ondřej",surname="Blažek",   email="clen3@pretorian.cz",    role="member",  credit_balance=200),
    ]

    created_members = []
    for m in members_raw:
        existing = db.query(Member).filter(Member.email == m["email"]).first()
        if existing:
            print(f"  ⏭  Člen {m['email']} již existuje (id={existing.member_id})")
            created_members.append(existing)
        else:
            member = Member(
                name=m["name"],
                surname=m["surname"],
                email=m["email"],
                password_hash=hash_pw(TEST_PASSWORD),
                role=m["role"],
                credit_balance=m["credit_balance"],
            )
            db.add(member)
            db.flush()
            created_members.append(member)
            print(f"  ✅ Člen {m['email']} (id={member.member_id}, role={m['role']})")

    # --- Zaměstnanci (trenéři + admin) ---
    staff = [m for m in created_members if m.role in ("trainer", "admin")]
    for member in staff:
        existing_emp = db.query(Employee).filter(Employee.employee_id == member.member_id).first()
        if existing_emp:
            print(f"  ⏭  Employee id={member.member_id} již existuje")
        else:
            emp = Employee(
                employee_id=member.member_id,
                bank_account_number="CZ6508000000192000145399",
                position="Trenér MMA" if member.role == "trainer" else "Administrátor",
                role=member.role,
                start_date="2024-01-01",
                type_of_empoyment="HPP",
            )
            db.add(emp)
            db.flush()
            print(f"  ✅ Employee {member.name} {member.surname} (id={emp.employee_id})")

    # --- Lekce ---
    trainer_members = [m for m in created_members if m.role == "trainer"]
    if not trainer_members:
        print("  ⚠  Žádní trenéři – lekce nevytvořím")
    else:
        t1 = trainer_members[0]
        t2 = trainer_members[1] if len(trainer_members) > 1 else trainer_members[0]
        now = datetime.now()

        lessons_data = [
            LessonSchedule(
                name="MMA začátečníci – pondělí",
                description="Úvodní lekce MMA pro nováčky.",
                duration=60,
                start_time=now + timedelta(days=1, hours=2),
                maximum_capacity=15,
                status="OPEN",
                price=250.00,
                employee_id=t1.member_id,
                lesson_type_id=types_data[0].lesson_type_id,
                lesson_template_id=templates_data[0].lesson_template_id,
            ),
            LessonSchedule(
                name="Kickbox pokročilí – středa",
                description="Intenzivní trénink pro pokročilé kickboxery.",
                duration=90,
                start_time=now + timedelta(days=3, hours=3),
                maximum_capacity=12,
                status="OPEN",
                price=300.00,
                employee_id=t2.member_id,
                lesson_type_id=types_data[1].lesson_type_id,
                lesson_template_id=templates_data[1].lesson_template_id,
            ),
            LessonSchedule(
                name="BJJ – technika",
                description="Technika submisí a přechodů poloh.",
                duration=75,
                start_time=now + timedelta(days=5, hours=4),
                maximum_capacity=10,
                status="OPEN",
                price=280.00,
                employee_id=t1.member_id,
                lesson_type_id=types_data[2].lesson_type_id,
                lesson_template_id=templates_data[2].lesson_template_id,
            ),
            LessonSchedule(
                name="MMA – volný trénink",
                description="Volný sparring a příprava bez pevné osnovy.",
                duration=120,
                start_time=now + timedelta(days=7, hours=1),
                maximum_capacity=20,
                status="OPEN",
                price=200.00,
                employee_id=t2.member_id,
                lesson_type_id=types_data[0].lesson_type_id,
            ),
            # Testovací lekce pro ověření funkce "Znovu otevřít"
            LessonSchedule(
                name="BJJ – minulý týden (dokončená)",
                description="Proběhlá lekce – testuje se znovu otevření.",
                duration=60,
                start_time=now - timedelta(days=3, hours=2),
                maximum_capacity=10,
                status="COMPLETED",
                price=280.00,
                employee_id=t1.member_id,
                lesson_type_id=types_data[2].lesson_type_id,
            ),
            LessonSchedule(
                name="Kickbox – zrušená lekce",
                description="Zrušená lekce – testuje se znovu otevření.",
                duration=90,
                start_time=now + timedelta(days=2, hours=5),
                maximum_capacity=12,
                status="CANCELLED",
                price=300.00,
                employee_id=t2.member_id,
                lesson_type_id=types_data[1].lesson_type_id,
            ),
        ]

        added = 0
        for lesson in lessons_data:
            exists = db.query(LessonSchedule).filter(LessonSchedule.name == lesson.name).first()
            if not exists:
                db.add(lesson)
                added += 1
            else:
                print(f"  ⏭  Lekce '{lesson.name}' již existuje")
        if added:
            db.flush()
            print(f"  ✅ Přidáno {added} lekcí")

    db.commit()
    print("\n✅ Seed dokončen!")
    print(f"\n📋 Testovací účty (heslo: {TEST_PASSWORD}):")
    print("  admin@pretorian.cz      — admin")
    print("  trener1@pretorian.cz    — trenér (Tomáš Kovář)")
    print("  trener2@pretorian.cz    — trenér (Jana Horáková)")
    print("  clen1@pretorian.cz      — člen (500 kreditů)")
    print("  clen2@pretorian.cz      — člen (300 kreditů)")
    print("  clen3@pretorian.cz      — člen (200 kreditů)")


if __name__ == "__main__":
    print("🔌 Připojuji se k databázi...")
    try:
        with SessionLocal() as db:
            seed(db)
    except Exception as e:
        print(f"\n❌ Chyba: {e}")
        print("💡 Ověř, že databáze běží: python ../DBS2/DBmanager.py init")
        sys.exit(1)
