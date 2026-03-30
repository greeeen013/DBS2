# Jednotkové testy pro endpointy plateb.
#
# Testuji celý kreditový cyklus – vytvoření platby, dokončení (přičtení kreditů),
# refundaci (odebrání kreditů) a zamítnutí neplatných stavových přechodů.


def test_create_payment_returns_pending(client, clen_s_kredity):
    """Nově vytvořená platba musí mít stav PENDING."""
    odpoved = client.post(
        "/payments/",
        json={
            "amount": 300,
            "payment_type": "CARD",
            "member_id": clen_s_kredity,
        },
    )
    assert odpoved.status_code == 201
    data = odpoved.json()
    assert data["status"] == "PENDING"
    assert data["member_id"] == clen_s_kredity


def test_complete_payment_adds_credits(client, clen_s_kredity):
    """Dokončení platby (COMPLETED) přičte amount kreditů na účet člena."""
    # Vytvoření platby 300 CZK = 300 kreditů
    platba = client.post(
        "/payments/",
        json={"amount": 300, "payment_type": "CARD", "member_id": clen_s_kredity},
    ).json()
    platba_id = platba["payment_id"]

    # Potvrzení platby
    odpoved = client.patch(
        f"/payments/{platba_id}/status",
        json={"status": "COMPLETED"},
    )
    assert odpoved.status_code == 200
    assert odpoved.json()["status"] == "COMPLETED"

    # Ověření zůstatku: člen měl 500, přičtení 300 = 800 kreditů
    zustatek = client.get(f"/members/{clen_s_kredity}/balance").json()
    assert zustatek["credit_balance"] == 800


def test_refund_payment_deducts_credits(client, clen_s_kredity):
    """Refundace platby (REFUNDED) odebere odpovídající počet kreditů."""
    platba = client.post(
        "/payments/",
        json={"amount": 200, "payment_type": "TRANSFER", "member_id": clen_s_kredity},
    ).json()
    platba_id = platba["payment_id"]

    # Nejdříve dokončit (přičte 200 kreditů → 700)
    client.patch(f"/payments/{platba_id}/status", json={"status": "COMPLETED"})

    # Pak refundovat (odebere 200 kreditů → zpět na 500)
    odpoved = client.patch(
        f"/payments/{platba_id}/status",
        json={"status": "REFUNDED"},
    )
    assert odpoved.status_code == 200
    assert odpoved.json()["status"] == "REFUNDED"

    zustatek = client.get(f"/members/{clen_s_kredity}/balance").json()
    assert zustatek["credit_balance"] == 500


def test_failed_payment_no_credit_change(client, clen_s_kredity):
    """Neúspěšná platba (FAILED) nesmí změnit kreditový zůstatek."""
    platba = client.post(
        "/payments/",
        json={"amount": 300, "payment_type": "CARD", "member_id": clen_s_kredity},
    ).json()
    platba_id = platba["payment_id"]

    client.patch(f"/payments/{platba_id}/status", json={"status": "FAILED"})

    # Zůstatek musí zůstat 500 (nezměněný)
    zustatek = client.get(f"/members/{clen_s_kredity}/balance").json()
    assert zustatek["credit_balance"] == 500


def test_invalid_status_transition_raises_422(client, clen_s_kredity):
    """Neplatný přechod (PENDING → REFUNDED) musí vrátit HTTP 422."""
    platba = client.post(
        "/payments/",
        json={"amount": 100, "payment_type": "CASH", "member_id": clen_s_kredity},
    ).json()
    platba_id = platba["payment_id"]

    # PENDING → REFUNDED není povolený přechod
    odpoved = client.patch(
        f"/payments/{platba_id}/status",
        json={"status": "REFUNDED"},
    )
    assert odpoved.status_code == 422
