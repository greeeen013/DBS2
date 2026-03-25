# Dependency Injection závislost pro databázovou session.
#
# FastAPI podporuje DI přes Depends() – tato funkce se zavolá před každým
# API handlerem, který ji deklaruje jako závislost (Depends(get_db)).
# Generátor (yield) zaručuje, že session se vždy uzavře – i při výjimce.
#
# Vzor použití v routě:
#   @router.get("/reservations")
#   def get_reservations(db: Session = Depends(get_db)):
#       return db.query(Reservation).all()

from collections.abc import Generator

from sqlalchemy.orm import Session

from .session import SessionLocal


def get_db() -> Generator[Session, None, None]:
    """
    Generátor pro databázovou session (Dependency Injection pro FastAPI).

    Otevře novou session před zpracováním requestu a garantovaně
    ji uzavře po jeho dokončení – bez ohledu na to, zda proběhl úspěšně.
    """
    db: Session = SessionLocal()
    try:
        yield db          # Předáme session do handleru.
    finally:
        db.close()        # Vždy zavřeme session – uvolní connection zpět do poolu.
