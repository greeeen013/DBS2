# Jednotkové testy pro endpointy plateb.
#
# Testuji celý kreditový cyklus – vytvoření platby, dokončení (přičtení kreditů),
# refundaci (odebrání kreditů) a zamítnutí neplatných stavových přechodů.
# COMPLETED smí nastavit jen admin – testy to ověřují.


def test_create_payment_returns_pending(client, clen_s_kredity, auth_headers):
    """Nově vytvořená platba musí mít stav PENDING."""
    odpoved = client.post(
        "/payments/",
        json={"amount": 300, "payment_type": "CARD", "member_id": clen_s_kredity},
        headers=auth_headers,
    )
    assert odpoved.status_code == 201
    data = odpoved.json()
    assert data["status"] == "PENDING"
    assert data["member_id"] == clen_s_kredity


def test_complete_payment_adds_credits(client, clen_s_kredity, auth_headers, admin_headers):
    """Dokončení platby (COMPLETED) přičte amount kreditů na účet člena – smí jen admin."""
    platba = client.post(
        "/payments/",
        json={"amount": 300, "payment_type": "CARD", "member_id": clen_s_kredity},
        headers=auth_headers,
    ).json()
    platba_id = platba["payment_id"]

    odpoved = client.patch(
        f"/payments/{platba_id}/status",
        json={"status": "COMPLETED"},
        headers=admin_headers,
    )
    assert odpoved.status_code == 200
    assert odpoved.json()["status"] == "COMPLETED"

    zustatek = client.get(
        f"/members/{clen_s_kredity}/balance",
        headers=auth_headers,
    ).json()
    assert zustatek["credit_balance"] == 800


def test_member_cannot_self_approve_payment(client, clen_s_kredity, auth_headers):
    """Člen nesmí sám sobě schválit platbu (COMPLETED) – musí vrátit 403."""
    platba = client.post(
        "/payments/",
        json={"amount": 99999, "payment_type": "CARD", "member_id": clen_s_kredity},
        headers=auth_headers,
    ).json()
    platba_id = platba["payment_id"]

    odpoved = client.patch(
        f"/payments/{platba_id}/status",
        json={"status": "COMPLETED"},
        headers=auth_headers,
    )
    assert odpoved.status_code == 403


def test_refund_payment_deducts_credits(client, clen_s_kredity, auth_headers, admin_headers):
    """Refundace platby (REFUNDED) odebere odpovídající počet kreditů."""
    platba = client.post(
        "/payments/",
        json={"amount": 200, "payment_type": "TRANSFER", "member_id": clen_s_kredity},
        headers=auth_headers,
    ).json()
    platba_id = platba["payment_id"]

    client.patch(
        f"/payments/{platba_id}/status",
        json={"status": "COMPLETED"},
        headers=admin_headers,
    )

    odpoved = client.patch(
        f"/payments/{platba_id}/status",
        json={"status": "REFUNDED"},
        headers=admin_headers,
    )
    assert odpoved.status_code == 200
    assert odpoved.json()["status"] == "REFUNDED"

    zustatek = client.get(
        f"/members/{clen_s_kredity}/balance",
        headers=auth_headers,
    ).json()
    assert zustatek["credit_balance"] == 500


def test_failed_payment_no_credit_change(client, clen_s_kredity, auth_headers, admin_headers):
    """Neúspěšná platba (FAILED) nesmí změnit kreditový zůstatek."""
    platba = client.post(
        "/payments/",
        json={"amount": 300, "payment_type": "CARD", "member_id": clen_s_kredity},
        headers=auth_headers,
    ).json()
    platba_id = platba["payment_id"]

    client.patch(
        f"/payments/{platba_id}/status",
        json={"status": "FAILED"},
        headers=admin_headers,
    )

    zustatek = client.get(
        f"/members/{clen_s_kredity}/balance",
        headers=auth_headers,
    ).json()
    assert zustatek["credit_balance"] == 500


def test_invalid_status_transition_raises_422(client, clen_s_kredity, auth_headers, admin_headers):
    """Neplatný přechod (PENDING → REFUNDED) musí vrátit HTTP 422."""
    platba = client.post(
        "/payments/",
        json={"amount": 100, "payment_type": "CASH", "member_id": clen_s_kredity},
        headers=auth_headers,
    ).json()
    platba_id = platba["payment_id"]

    odpoved = client.patch(
        f"/payments/{platba_id}/status",
        json={"status": "REFUNDED"},
        headers=admin_headers,
    )
    assert odpoved.status_code == 422


def test_idor_payment_forbidden(client, clen_s_kredity, auth_headers_bez_kreditů, admin_headers):
    """Člen nesmí měnit stav platby jiného člena – musí vrátit 403."""
    # Platba patří clen_s_kredity, admin ji vytvoří
    platba = client.post(
        "/payments/",
        json={"amount": 100, "payment_type": "CARD", "member_id": clen_s_kredity},
        headers=admin_headers,
    ).json()
    platba_id = platba["payment_id"]

    # Útočník (clen_bez_kreditů) se pokusí označit cizí platbu jako FAILED
    odpoved = client.patch(
        f"/payments/{platba_id}/status",
        json={"status": "FAILED"},
        headers=auth_headers_bez_kreditů,
    )
    assert odpoved.status_code == 403
