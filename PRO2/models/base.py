# Sdílená deklarativní základna pro všechny SQLAlchemy modely.
# Všechny modely musí dědit z této Base – SQLAlchemy pak ví o všech tabulkách
# a může je spravovat (migrace, introspekce schématu atd.).

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
