# Konfigurace testovacího prostředí pro pytest.
#
# Používám SQLite in-memory databázi s StaticPool – to zajistí, že všechna
# připojení (fixture + API handler) sdílí stejnou instanci DB. Bez StaticPool
# by každý FastAPI request dostal prázdnou in-memory DB a neviděl testovací data.
#
# Proč ne PostgreSQL? Testy musí běžet i bez spuštěného Docker containeru.
# SQLite postačí pro ověření business logiky; integrace s PostgreSQL se testuje ručně.

import os
import sys

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Zajistíme, že Python najde moduly z PRO2/ i při spuštění testů z jiného adresáře.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from auth.jwt import vytvor_token  # noqa: E402 – musí být po sys.path.insert

TESTOVACI_DB_URL = "sqlite:///:memory:"

# StaticPool – všechna připojení používají stejné fyzické SQLite spojení.
# To je nezbytné pro in-memory SQLite, kde každé "nové" spojení by dostalo prázdnou DB.
engine_test = create_engine(
    TESTOVACI_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    bind=engine_test,
    autocommit=False,
    autoflush=False,
)


def _registruj_stub_tabulky():
    """
    Zaregistruje minimální stub tabulky pro FK závislosti, které nejsou součástí
    testovací DB. SQLAlchemy vyžaduje, aby referenced tabulky existovaly v metadata
    při create_all() – i když SQLite FK enforcement je vypnutý.

    Stub tabulky obsahují jen PK sloupec – dostatečné pro splnění FK podmínek.
    """
    from sqlalchemy import Column, Integer, Table
    from models.base import Base

    for nazev, pk_sloupec in [
        ("lesson_schedule", "lesson_schedule_id"),
        ("membership", "membership_id"),
        ("discount_code", "discount_code_id"),
    ]:
        if nazev not in Base.metadata.tables:
            Table(
                nazev,
                Base.metadata,
                Column(pk_sloupec, Integer, primary_key=True),
            )


@pytest.fixture(autouse=True)
def setup_db():
    """Před každým testem vytvoří tabulky, po testu je smaže (izolace testů)."""
    from models import Base  # Import uvnitř funkce – zajistí, že modely jsou načteny
    _registruj_stub_tabulky()
    Base.metadata.create_all(bind=engine_test)
    yield
    Base.metadata.drop_all(bind=engine_test)


@pytest.fixture
def client():
    """FastAPI TestClient s přepsanou DB závislostí – používá testovací SQLite."""
    from db.dependencies import get_db
    from main import app

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def clen_s_kredity(client):
    """
    Testovací člen s 500 kredity – vytvoří se přímo v DB před testem.
    Vrací member_id pro použití v API voláních.
    """
    from models.member import Member

    db = TestingSessionLocal()
    clen = Member(name="Pavel", surname="Novak", credit_balance=500)
    db.add(clen)
    db.commit()
    clen_id = clen.member_id
    db.close()
    return clen_id


@pytest.fixture
def clen_bez_kreditů(client):
    """Testovací člen s 0 kredity – pro ověření odmítnutí potvrzení rezervace."""
    from models.member import Member

    db = TestingSessionLocal()
    clen = Member(name="Chuda", surname="Kovalova", credit_balance=0)
    db.add(clen)
    db.commit()
    clen_id = clen.member_id
    db.close()
    return clen_id


@pytest.fixture
def auth_headers(clen_s_kredity):
    """Bearer token pro přihlášeného člena (role=member)."""
    token = vytvor_token(member_id=clen_s_kredity, role="member")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(clen_s_kredity):
    """Bearer token s rolí admin – potřebný pro schválení platby (COMPLETED)."""
    token = vytvor_token(member_id=clen_s_kredity, role="admin")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def auth_headers_bez_kreditů(clen_bez_kreditů):
    """Bearer token pro člena bez kreditů."""
    token = vytvor_token(member_id=clen_bez_kreditů, role="member")
    return {"Authorization": f"Bearer {token}"}
