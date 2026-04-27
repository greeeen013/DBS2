# Jednotkové testy pro endpointy rezervací.
#
# Testuji business logiku kreditového systému – odečtení při potvrzení,
# vrácení při zrušení a odmítnutí při nedostatku kreditů.
# Každý test je nezávislý díky autouse fixture setup_db v conftest.py.


def test_create_reservation_returns_confirmed_and_deducts_credits(client, clen_s_kredity, auth_headers):
    """Nově vytvořená rezervace je rovnou CONFIRMED a odečte 100 kreditů (cena lekce)."""
    odpoved = client.post(
        "/reservations/",
        json={
            "member_id": clen_s_kredity,
            "lesson_schedule_id": 1,
            "note": "Testovaci rezervace",
        },
        headers=auth_headers,
    )
    assert odpoved.status_code == 201
    data = odpoved.json()
    assert data["status"] == "CONFIRMED"
    assert data["member_id"] == clen_s_kredity
    # Člen měl 500, odečtení 100 = 400 kreditů
    assert data["credit_balance"] == 400


def test_create_reservation_insufficient_credits(client, clen_bez_kreditů, auth_headers_bez_kreditů):
    """Vytvoření rezervace při nedostatku kreditů musí vrátit HTTP 422."""
    odpoved = client.post(
        "/reservations/",
        json={"member_id": clen_bez_kreditů, "lesson_schedule_id": 1},
        headers=auth_headers_bez_kreditů,
    )
    assert odpoved.status_code == 422
    assert "kredit" in odpoved.json()["detail"].lower()


def test_cancel_confirmed_reservation_refunds_credits(client, clen_s_kredity, auth_headers):
    """Zrušení potvrzené rezervace (CONFIRMED → CANCELLED) vrátí kredity zpět."""
    rezervace = client.post(
        "/reservations/",
        json={"member_id": clen_s_kredity, "lesson_schedule_id": 1},
        headers=auth_headers,
    ).json()
    rezervace_id = rezervace["reservation_id"]

    odpoved = client.patch(
        f"/reservations/{rezervace_id}/status",
        json={"status": "CANCELLED"},
        headers=auth_headers,
    )
    assert odpoved.status_code == 200
    data = odpoved.json()
    assert data["status"] == "CANCELLED"
    assert data["credit_balance"] == 500


def test_invalid_status_transition_raises_422(client, clen_s_kredity, auth_headers):
    """Neplatný přechod stavového automatu (CONFIRMED → CREATED) musí vrátit 422."""
    rezervace = client.post(
        "/reservations/",
        json={"member_id": clen_s_kredity, "lesson_schedule_id": 1},
        headers=auth_headers,
    ).json()
    rezervace_id = rezervace["reservation_id"]

    odpoved = client.patch(
        f"/reservations/{rezervace_id}/status",
        json={"status": "CREATED"},
        headers=auth_headers,
    )
    assert odpoved.status_code == 422


def test_idor_reservation_forbidden(client, clen_s_kredity, auth_headers_bez_kreditů):
    """Člen nesmí měnit stav rezervace jiného člena – musí vrátit 403."""
    from auth.jwt import vytvor_token

    # Rezervace patří clen_s_kredity
    token_vlastnika = f"Bearer {vytvor_token(member_id=clen_s_kredity, role='member')}"
    rezervace = client.post(
        "/reservations/",
        json={"member_id": clen_s_kredity, "lesson_schedule_id": 1},
        headers={"Authorization": token_vlastnika},
    ).json()
    rezervace_id = rezervace["reservation_id"]

    # Útočník (clen_bez_kreditů) se pokusí změnit cizí rezervaci
    odpoved = client.patch(
        f"/reservations/{rezervace_id}/status",
        json={"status": "CANCELLED"},
        headers=auth_headers_bez_kreditů,
    )
    assert odpoved.status_code == 403
