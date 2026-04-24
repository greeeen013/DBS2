"""
Správa rolí členů MMA klubu.

Spuštění:  python rolemanager.py
"""

import datetime
from db.session import SessionLocal
from models.member import Member
from sqlalchemy import text

ROLES = ("member", "trainer", "admin")


def list_members(db):
    members = db.query(Member).order_by(Member.role, Member.surname).all()
    print(f"\n{'ID':<5} {'Email':<30} {'Jméno':<25} {'Role':<10}")
    print("-" * 72)
    for m in members:
        print(f"{m.member_id:<5} {m.email or '—':<30} {m.name} {m.surname:<20} {m.role}")
    print()


def ensure_employee_record(db, member: Member):
    existing = db.execute(
        text("SELECT employee_id FROM employee WHERE employee_id = :mid"),
        {"mid": member.member_id},
    ).fetchone()
    if existing:
        return False
    db.execute(
        text("""
            INSERT INTO employee (employee_id, bank_account_number, position, start_date, type_of_empoyment)
            VALUES (:eid, 'CZ0000000000000000000000', 'Trenér', :today, 'HPP')
        """),
        {"eid": member.member_id, "today": datetime.date.today()},
    )
    return True


def remove_employee_record(db, member: Member):
    db.execute(
        text("DELETE FROM employee WHERE employee_id = :mid"),
        {"mid": member.member_id},
    )


def change_role(db):
    email = input("Email člena: ").strip()
    member = db.query(Member).filter(Member.email == email).first()
    if not member:
        print(f"Člen s emailem '{email}' nenalezen.")
        return

    print(f"Aktuální role: {member.role}")
    print(f"Dostupné role: {', '.join(ROLES)}")
    new_role = input("Nová role: ").strip().lower()

    if new_role not in ROLES:
        print(f"Neplatná role. Povolené hodnoty: {', '.join(ROLES)}")
        return

    old_role = member.role
    member.role = new_role

    if new_role == "trainer" and old_role != "trainer":
        created = ensure_employee_record(db, member)
        if created:
            print("  → Vytvořen záznam v tabulce 'employee' (nutné pro statistiky trenérů).")
    elif old_role in ("trainer", "admin") and new_role == "member":
        remove_employee_record(db, member)
        print("  → Odstraněn záznam z tabulky 'employee'.")

    db.commit()
    print(f"Role změněna: {old_role} → {new_role}")


def main():
    db = SessionLocal()
    try:
        while True:
            print("\n=== Role Manager ===")
            print("1) Zobrazit všechny členy")
            print("2) Změnit roli")
            print("0) Konec")
            choice = input("Volba: ").strip()

            if choice == "1":
                list_members(db)
            elif choice == "2":
                list_members(db)
                change_role(db)
            elif choice == "0":
                break
            else:
                print("Neplatná volba.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
