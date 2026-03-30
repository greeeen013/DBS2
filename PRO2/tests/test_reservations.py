# Jednotkové testy pro endpointy rezervací.
#
# Testuji business logiku kreditového systému – odečtení při potvrzení,
# vrácení při zrušení a odmítnutí při nedostatku kreditů.
# Každý test je nezávislý díky autouse fixture setup_db v conftest.py.


def test_create_reservation_returns_created(client, clen_s_kredity):
    """Nově vytvořená rezervace musí mít stav CREATED."""
    odpoved = client.post(
        "/reservations/",
        json={
            "member_id": clen_s_kredity,
            "lesson_schedule_id": 1,
            "note": "Testovaci rezervace",
        },
    )
    assert odpoved.status_code == 201
    data = odpoved.json()
    assert data["status"] == "CREATED"
    assert data["member_id"] == clen_s_kredity


def test_confirm_reservation_deducts_credits(client, clen_s_kredity):
    """Potvrzení rezervace (CONFIRMED) odečte 100 kreditů z účtu člena."""
    # Vytvoření rezervace
    rezervace = client.post(
        "/reservations/",
        json={"member_id": clen_s_kredity, "lesson_schedule_id": 1},
    ).json()
    rezervace_id = rezervace["reservation_id"]

    # Potvrzení rezervace
    odpoved = client.patch(
        f"/reservations/{rezervace_id}/status",
        json={"status": "CONFIRMED"},
    )
    assert odpoved.status_code == 200
    data = odpoved.json()
    assert data["status"] == "CONFIRMED"
    # Člen měl 500, odečtení 100 = 400 kreditů
    assert data["credit_balance"] == 400


def test_confirm_reservation_insufficient_credits(client, clen_bez_kreditů):
    """Potvrzení rezervace při nedostatku kreditů musí vrátit HTTP 422."""
    rezervace = client.post(
        "/reservations/",
        json={"member_id": clen_bez_kreditů, "lesson_schedule_id": 1},
    ).json()
    rezervace_id = rezervace["reservation_id"]

    odpoved = client.patch(
        f"/reservations/{rezervace_id}/status",
        json={"status": "CONFIRMED"},
    )
    assert odpoved.status_code == 422
    # Odpověď musí obsahovat srozumitelnou chybovou zprávu
    assert "kredit" in odpoved.json()["detail"].lower()


def test_cancel_confirmed_reservation_refunds_credits(client, clen_s_kredity):
    """Zrušení potvrzené rezervace (CONFIRMED → CANCELLED) vrátí kredity zpět."""
    rezervace = client.post(
        "/reservations/",
        json={"member_id": clen_s_kredity, "lesson_schedule_id": 1},
    ).json()
    rezervace_id = rezervace["reservation_id"]

    # Nejdříve potvrdit (odečte 100 kreditů)
    client.patch(f"/reservations/{rezervace_id}/status", json={"status": "CONFIRMED"})

    # Pak zrušit (vrátí 100 kreditů)
    odpoved = client.patch(
        f"/reservations/{rezervace_id}/status",
        json={"status": "CANCELLED"},
    )
    assert odpoved.status_code == 200
    data = odpoved.json()
    assert data["status"] == "CANCELLED"
    # Kredity se vrátily zpět na 500
    assert data["credit_balance"] == 500


def test_invalid_status_transition_raises_422(client, clen_s_kredity):
    """Neplatný přechod stavového automatu (CREATED → ATTENDED) musí vrátit 422."""
    rezervace = client.post(
        "/reservations/",
        json={"member_id": clen_s_kredity, "lesson_schedule_id": 1},
    ).json()
    rezervace_id = rezervace["reservation_id"]

    # CREATED → ATTENDED není povolený přechod
    odpoved = client.patch(
        f"/reservations/{rezervace_id}/status",
        json={"status": "ATTENDED"},
    )
    assert odpoved.status_code == 422
