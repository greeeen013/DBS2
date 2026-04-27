# Testy pro endpoint GET /me/history (IR04).
#
# Všechny fixtures jsou definovány v conftest.py:
#   client, clen_s_kredity, auth_headers,
#   clen_bez_kreditů, auth_headers_bez_kreditů


def test_me_history_vyzaduje_auth(client):
    """Požadavek bez Bearer tokenu musí být odmítnut (403)."""
    resp = client.get("/me/history")
    assert resp.status_code == 401


def test_me_history_prazdna_pro_noveho_clena(client, clen_s_kredity, auth_headers):
    """Nový člen bez dat dostane prázdná pole."""
    resp = client.get("/me/history", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["reservations"] == []
    assert data["payments"] == []


def test_me_history_obsahuje_rezervace(client, clen_s_kredity, auth_headers):
    """Rezervace vytvořená přes POST /reservations/ se musí objevit v historii."""
    client.post(
        "/reservations/",
        json={"member_id": clen_s_kredity, "lesson_schedule_id": 1},
        headers=auth_headers,
    )
    resp = client.get("/me/history", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["reservations"]) == 1
    assert data["reservations"][0]["member_id"] == clen_s_kredity
    assert data["reservations"][0]["status"] == "CONFIRMED"


def test_me_history_obsahuje_platby(client, clen_s_kredity, auth_headers):
    """Platba vytvořená přes POST /payments/ se musí objevit v historii."""
    client.post(
        "/payments/",
        json={"amount": 200, "payment_type": "CARD", "member_id": clen_s_kredity},
        headers=auth_headers,
    )
    resp = client.get("/me/history", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["payments"]) == 1
    assert data["payments"][0]["member_id"] == clen_s_kredity
    assert data["payments"][0]["status"] == "PENDING"


def test_me_history_izolace(
    client,
    clen_s_kredity,
    auth_headers,
    clen_bez_kreditů,
    auth_headers_bez_kreditů,
):
    """Člen vidí jen svá data – ne data jiného člena."""
    # Rezervace patří clen_s_kredity
    client.post(
        "/reservations/",
        json={"member_id": clen_s_kredity, "lesson_schedule_id": 1},
        headers=auth_headers,
    )
    # clen_bez_kreditů nesmí vidět tuto rezervaci
    resp = client.get("/me/history", headers=auth_headers_bez_kreditů)
    assert resp.status_code == 200
    assert resp.json()["reservations"] == []


def test_me_history_rezervace_serazeny_desc(client, clen_s_kredity, auth_headers):
    """Více rezervací musí být seřazeno sestupně dle timestamp_creation."""
    client.post(
        "/reservations/",
        json={"member_id": clen_s_kredity, "lesson_schedule_id": 1},
        headers=auth_headers,
    )
    client.post(
        "/reservations/",
        json={"member_id": clen_s_kredity, "lesson_schedule_id": 2},
        headers=auth_headers,
    )
    resp = client.get("/me/history", headers=auth_headers)
    assert resp.status_code == 200
    rezervace = resp.json()["reservations"]
    assert len(rezervace) == 2
    # Nejnovější (druhá vytvořená) musí být první v seznamu
    from datetime import datetime, timezone
    t1 = datetime.fromisoformat(rezervace[0]["timestamp_creation"])
    t2 = datetime.fromisoformat(rezervace[1]["timestamp_creation"])
    assert t1 >= t2
