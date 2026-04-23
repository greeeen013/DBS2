-- ===========================================================================
-- 1. INDEXY
-- ===========================================================================

CREATE INDEX IF NOT EXISTS idx_lesson_schedule_start ON lesson_schedule (start_time);
CREATE INDEX IF NOT EXISTS idx_reservation_member ON reservation (member_id);
CREATE INDEX IF NOT EXISTS idx_reservation_lesson ON reservation (lesson_schedule_id);
CREATE INDEX IF NOT EXISTS idx_membership_member ON membership (member_id);
CREATE INDEX IF NOT EXISTS idx_membership_valid_to ON membership (valid_to);
CREATE INDEX IF NOT EXISTS idx_attendance_member ON attendance (member_id);

-- Kompozitní PK pro vazební tabulku plateb (pokud chybí)
ALTER TABLE reservation_payment
DROP CONSTRAINT IF EXISTS pk_reservation_payment_composite;

ALTER TABLE reservation_payment
ADD CONSTRAINT pk_reservation_payment_composite
PRIMARY KEY (reservation_id, payment_id);


-- ===========================================================================
-- 2. POHLEDY (3x)
-- ===========================================================================

-- 1. Rozvrh s výpočtem volné kapacity
CREATE OR REPLACE VIEW v_schedule_with_capacity AS
SELECT
    ls.lesson_schedule_id,
    ls.name        AS lesson_name,
    ls.start_time,
    ls.maximum_capacity,
    COUNT(r.reservation_id)                              AS occupied_slots,
    (ls.maximum_capacity - COUNT(r.reservation_id))     AS free_slots
FROM lesson_schedule ls
LEFT JOIN reservation r
    ON ls.lesson_schedule_id = r.lesson_schedule_id AND r.status != 'CANCELLED'
GROUP BY ls.lesson_schedule_id, ls.name, ls.start_time, ls.maximum_capacity;


-- 2. Členové bez aktivní permanentky
--    (nikdy nezakoupili, nebo jejich poslední permanentka již vypršela)
CREATE OR REPLACE VIEW v_members_no_active_membership AS
SELECT
    m.member_id,
    m.name,
    m.surname,
    m.email,
    m.credit_balance,
    MAX(ms.valid_to) AS last_membership_expiry
FROM member m
LEFT JOIN membership ms ON m.member_id = ms.member_id
WHERE m.role = 'member'
GROUP BY m.member_id, m.name, m.surname, m.email, m.credit_balance
HAVING MAX(ms.valid_to) < NOW() OR MAX(ms.valid_to) IS NULL;


-- 3. Statistiky trenérů – počet odučených lekcí a celkových rezervací
CREATE OR REPLACE VIEW v_trainer_stats AS
SELECT
    e.employee_id,
    m.name,
    m.surname,
    COUNT(DISTINCT ls.lesson_schedule_id)               AS total_lessons,
    COUNT(r.reservation_id)                             AS total_reservations,
    COUNT(CASE WHEN r.attendance = true THEN 1 END)     AS attended_count
FROM employee e
JOIN member m ON e.employee_id = m.member_id
LEFT JOIN lesson_schedule ls ON e.employee_id = ls.employee_id
LEFT JOIN reservation r
    ON ls.lesson_schedule_id = r.lesson_schedule_id AND r.status != 'CANCELLED'
GROUP BY e.employee_id, m.name, m.surname;


-- ===========================================================================
-- 3. FUNKCE (3x standalone)
-- ===========================================================================

-- 1. Výpočet ceny tarifu po aplikaci slevového procenta
CREATE OR REPLACE FUNCTION fn_get_tariff_price(
    p_tariff_id       INT,
    p_discount_percent NUMERIC DEFAULT 0
)
RETURNS NUMERIC AS $$
DECLARE
    v_price NUMERIC;
BEGIN
    SELECT price INTO v_price FROM tariff WHERE tariff_id = p_tariff_id;
    IF v_price IS NULL THEN
        RAISE EXCEPTION 'Tarif % nenalezen', p_tariff_id;
    END IF;
    RETURN ROUND(v_price * (1 - p_discount_percent / 100), 2);
END;
$$ LANGUAGE plpgsql;


-- 2. Kontrola volné kapacity lekce (TRUE = místo je, FALSE = plno/neexistuje)
CREATE OR REPLACE FUNCTION fn_check_lesson_capacity(p_lesson_id INT)
RETURNS BOOLEAN AS $$
DECLARE
    v_max     INT;
    v_current INT;
BEGIN
    SELECT maximum_capacity INTO v_max
    FROM lesson_schedule WHERE lesson_schedule_id = p_lesson_id;

    IF v_max IS NULL THEN RETURN FALSE; END IF;

    SELECT COUNT(*) INTO v_current
    FROM reservation
    WHERE lesson_schedule_id = p_lesson_id AND status != 'CANCELLED';

    RETURN v_current < v_max;
END;
$$ LANGUAGE plpgsql;


-- 3. Detaily člena jako JSON
CREATE OR REPLACE FUNCTION fn_get_member_details_json(p_member_id INT)
RETURNS JSON AS $$
    SELECT row_to_json(t)
    FROM (
        SELECT member_id, name, surname, email, credit_balance, role, phone_number
        FROM member
        WHERE member_id = p_member_id
    ) t;
$$ LANGUAGE sql;


-- ===========================================================================
-- 4. TRIGGERY (2x)
-- ===========================================================================

-- Trigger 1: BEFORE INSERT – fail-safe kontrola kapacity lekce
CREATE OR REPLACE FUNCTION fn_validate_reservation()
RETURNS TRIGGER AS $$
DECLARE
    v_curr_occupied INT;
    v_max_cap       INT;
BEGIN
    SELECT maximum_capacity INTO v_max_cap
    FROM lesson_schedule
    WHERE lesson_schedule_id = NEW.lesson_schedule_id
    FOR SHARE;

    SELECT COUNT(*) INTO v_curr_occupied
    FROM reservation
    WHERE lesson_schedule_id = NEW.lesson_schedule_id AND status != 'CANCELLED';

    IF v_curr_occupied >= v_max_cap THEN
        RAISE EXCEPTION 'Kapacita lekce je vyčerpána.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pre_reservation_check ON reservation;
CREATE TRIGGER trg_pre_reservation_check
BEFORE INSERT ON reservation
FOR EACH ROW EXECUTE FUNCTION fn_validate_reservation();


-- Trigger 2: AFTER UPDATE – automatické snížení kreditu při potvrzení rezervace.
--   Funguje pro lekce s nastavenou cenou (lesson_schedule.price IS NOT NULL).
--   Lekce bez ceny (tarif-based) zpracovává Python backend (CENA_LEKCE = 100).
CREATE OR REPLACE FUNCTION fn_auto_deduct_credit()
RETURNS TRIGGER AS $$
DECLARE
    v_price NUMERIC;
BEGIN
    IF NEW.status = 'CONFIRMED' AND (OLD.status IS NULL OR OLD.status != 'CONFIRMED') THEN
        SELECT COALESCE(price, 0) INTO v_price
        FROM lesson_schedule WHERE lesson_schedule_id = NEW.lesson_schedule_id;

        IF v_price > 0 THEN
            UPDATE member
            SET credit_balance = credit_balance - v_price
            WHERE member_id = NEW.member_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_after_reservation_confirmed ON reservation;
CREATE TRIGGER trg_after_reservation_confirmed
AFTER UPDATE OF status ON reservation
FOR EACH ROW EXECUTE FUNCTION fn_auto_deduct_credit();


-- ===========================================================================
-- 5. PROCEDURY (3x) s ošetřeným ROLLBACK scénářem
-- ===========================================================================

-- 1. Bezpečné vytvoření rezervace – validace probíhá přes trigger výše
CREATE OR REPLACE PROCEDURE pr_secure_booking(
    p_member_id   INT,
    p_schedule_id INT
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO reservation (member_id, lesson_schedule_id, status, timestamp_creation, attendance)
    VALUES (p_member_id, p_schedule_id, 'CREATED', NOW(), false);
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Rezervaci se nepodařilo vytvořit: %', SQLERRM;
END;
$$;


-- 2. Uzavření měsíčního vyúčtování
--    Označí PENDING platby jako FAILED, pokud jim vypršela asociovaná permanentka
CREATE OR REPLACE PROCEDURE pr_close_monthly_billing()
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE payment
    SET status = 'FAILED'
    WHERE status = 'PENDING'
      AND membership_id IN (
          SELECT membership_id FROM membership WHERE valid_to < NOW()
      );
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Chyba při uzavírání vyúčtování: %', SQLERRM;
END;
$$;


-- 3. Archivace neaktivních členů
--    Nastaví is_active = false členům bez platné permanentky
CREATE OR REPLACE PROCEDURE pr_archive_inactive_members()
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE member
    SET is_active = false
    WHERE role = 'member'
      AND (is_active IS NULL OR is_active = true)
      AND member_id NOT IN (
          SELECT DISTINCT member_id FROM membership WHERE valid_to >= NOW()
      );
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Chyba při archivaci členů: %', SQLERRM;
END;
$$;
