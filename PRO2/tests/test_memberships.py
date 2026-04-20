import pytest
from datetime import datetime, timedelta

from auth.jwt import vytvor_token
from models.member import Member
from models.membership import Membership
from models.tariff import Tariff


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def tarif(client):
    """Tarif za 100 kreditů – vložen přímo do testovací DB."""
    from tests.conftest import TestingSessionLocal
    db = TestingSessionLocal()
    t = Tariff(name="Měsíční permanentka", price=100, description="Plný přístup na 30 dní")
    db.add(t)
    db.commit()
    tarif_id = t.tariff_id
    db.close()
    return tarif_id


@pytest.fixture
def drahy_tarif(client):
    """Tarif za 9999 kreditů – pro test nedostatku kreditů."""
    from tests.conftest import TestingSessionLocal
    db = TestingSessionLocal()
    t = Tariff(name="VIP permanentka", price=9999)
    db.add(t)
    db.commit()
    tarif_id = t.tariff_id
    db.close()
    return tarif_id


# ---------------------------------------------------------------------------
# Testy endpointu GET /tariffs
# ---------------------------------------------------------------------------

def test_get_tariffs_prazdny_seznam(client):
    """Bez tarifů v DB vrátí prázdný seznam."""
    resp = client.get("/tariffs")
    assert resp.status_code == 200
    assert resp.json() == []


def test_get_tariffs_vrati_tarify(client, tarif):
    """Vrátí seznam tarifů včetně ceny a popisu."""
    resp = client.get("/tariffs")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["name"] == "Měsíční permanentka"
    assert float(data[0]["price"]) == 100.0


# ---------------------------------------------------------------------------
# Testy endpointu POST /tariffs (admin only)
# ---------------------------------------------------------------------------

def test_admin_muze_vytvorit_tarif(client, admin_headers):
    """Admin může přidat nový tarif přes POST /tariffs."""
    resp = client.post(
        "/tariffs",
        json={"name": "Roční permanentka", "price": "800.00", "description": "12 měsíců"},
        headers=admin_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Roční permanentka"
    assert float(data["price"]) == 800.0
    assert data["tariff_id"] is not None


def test_clen_nemuze_vytvorit_tarif(client, auth_headers):
    """Člen bez role admin obdrží 403 při pokusu vytvořit tarif."""
    resp = client.post(
        "/tariffs",
        json={"name": "Pokus", "price": "50.00"},
        headers=auth_headers,
    )
    assert resp.status_code == 403


def test_neprihlaseny_nemuze_vytvorit_tarif(client):
    """Bez tokenu vrátí 401/403 (HTTPBearer odmítne request)."""
    resp = client.post("/tariffs", json={"name": "Pokus", "price": "50.00"})
    assert resp.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Testy endpointu POST /memberships (zakoupení permanentky)
# ---------------------------------------------------------------------------

def test_uspesne_zakoupeni(client, auth_headers, tarif, clen_s_kredity):
    """Úspěšné zakoupení: vrátí 201, odečte kredity, vytvoří Membership."""
    from tests.conftest import TestingSessionLocal

    resp = client.post("/memberships", json={"tariff_id": tarif}, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["tariff_id"] == tarif
    assert data["member_id"] == clen_s_kredity
    assert "valid_from" in data
    assert "valid_to" in data

    # Ověření odečtení kreditů v DB
    db = TestingSessionLocal()
    clen = db.get(Member, clen_s_kredity)
    assert clen.credit_balance == 400  # 500 - 100
    db.close()


def test_nedostatek_kreditů(client, auth_headers_bez_kreditů, drahy_tarif):
    """Člen bez kreditů obdrží 402."""
    resp = client.post(
        "/memberships",
        json={"tariff_id": drahy_tarif},
        headers=auth_headers_bez_kreditů,
    )
    assert resp.status_code == 402


def test_neexistujici_tarif(client, auth_headers):
    """Neexistující tariff_id vrátí 404."""
    resp = client.post("/memberships", json={"tariff_id": 9999}, headers=auth_headers)
    assert resp.status_code == 404


def test_duplicitni_aktivni_permanentka(client, auth_headers, tarif, clen_s_kredity):
    """Druhý nákup stejného aktivního tarifu vrátí 409."""
    # první nákup
    r1 = client.post("/memberships", json={"tariff_id": tarif}, headers=auth_headers)
    assert r1.status_code == 201

    # druhý nákup – musí selhat
    r2 = client.post("/memberships", json={"tariff_id": tarif}, headers=auth_headers)
    assert r2.status_code == 409


def test_trainer_muze_koupit_permanentku(client, tarif):
    """Trenér může zakoupit permanentku (není omezen jen na členy)."""
    from tests.conftest import TestingSessionLocal

    db = TestingSessionLocal()
    trainer = Member(name="Trenér", surname="Novák", credit_balance=500, role="trainer")
    db.add(trainer)
    db.commit()
    trainer_id = trainer.member_id
    db.close()

    token = vytvor_token(member_id=trainer_id, role="trainer")
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.post("/memberships", json={"tariff_id": tarif}, headers=headers)
    assert resp.status_code == 201


# ---------------------------------------------------------------------------
# Testy endpointu GET /memberships/me
# ---------------------------------------------------------------------------

def test_get_my_memberships_prazdny(client, auth_headers):
    """Bez permanentek vrátí prázdný seznam."""
    resp = client.get("/memberships/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json() == []


def test_get_my_memberships_po_nakupu(client, auth_headers, tarif, clen_s_kredity):
    """Po nákupu vrátí seznam s jednou permanentkou včetně tariff_name."""
    client.post("/memberships", json={"tariff_id": tarif}, headers=auth_headers)

    resp = client.get("/memberships/me", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["tariff_name"] == "Měsíční permanentka"
    assert data[0]["member_id"] == clen_s_kredity
