-- ===========================================================================
-- 1. INDEXY
-- ===========================================================================

-- Zrychlení vyhledávání v rozvrhu podle času startu lekce
CREATE INDEX IF NOT EXISTS idx_lesson_schedule_start ON lesson_schedule (start_time);

-- PK pro vazební tabulku plateb
-- dump.sql PK u reservation_payment neobsahuje, tímto zajistíme
ALTER TABLE reservation_payment 
DROP CONSTRAINT IF EXISTS pk_reservation_payment_composite;

ALTER TABLE reservation_payment 
ADD CONSTRAINT pk_reservation_payment_composite 
PRIMARY KEY (reservation_id, payment_id);


-- ===========================================================================
-- 2. POHLEDY
-- ===========================================================================

-- Přehled rozvrhu s výpočtem volných kapacit
CREATE OR REPLACE VIEW v_schedule_with_capacity AS
SELECT 
    ls.lesson_schedule_id,
    ls.name AS lesson_name,
    ls.start_time,
    ls.maximum_capacity,
    COUNT(r.reservation_id) AS occupied_slots,
    (ls.maximum_capacity - COUNT(r.reservation_id)) AS free_slots
FROM lesson_schedule ls
LEFT JOIN reservation r ON ls.lesson_schedule_id = r.lesson_schedule_id 
    AND r.status != 'CANCELLED'
GROUP BY ls.lesson_schedule_id, ls.name, ls.start_time, ls.maximum_capacity;

-- Přehled dlužníků - členové s nižším kreditem, než je cena jejich potvrzených lekcí
CREATE OR REPLACE VIEW v_debtors_overview AS
SELECT 
    m.member_id,
    m.name,
    m.surname,
    m.credit_balance,
    SUM(ls.price) AS unpaid_reservations_total
FROM member m
JOIN reservation r ON m.member_id = r.member_id
JOIN lesson_schedule ls ON r.lesson_schedule_id = ls.lesson_schedule_id
WHERE r.status = 'CONFIRMED' AND ls.price > 0
GROUP BY m.member_id, m.name, m.surname, m.credit_balance
HAVING (m.credit_balance - SUM(ls.price)) < 0;


-- ===========================================================================
-- 3. FUNKCE A TRIGGERY
-- ===========================================================================

-- Fail-safe kontrola kapacity a kreditu před vytvořením rezervace
CREATE OR REPLACE FUNCTION fn_validate_reservation()
RETURNS TRIGGER AS $$
DECLARE
    v_curr_occupied INT;
    v_max_cap INT;
    v_price DECIMAL;
    v_user_credit INT;
BEGIN
    -- Zamknutí řádku lekce pro výpočet kapacity
    SELECT maximum_capacity, price INTO v_max_cap, v_price
    FROM lesson_schedule WHERE lesson_schedule_id = NEW.lesson_schedule_id FOR SHARE;

    SELECT COUNT(*) INTO v_curr_occupied 
    FROM reservation WHERE lesson_schedule_id = NEW.lesson_schedule_id AND status != 'CANCELLED';

    IF v_curr_occupied >= v_max_cap THEN
        RAISE EXCEPTION 'Kapacita lekce je vyčerpána.';
    END IF;

    -- Kontrola kreditu člena
    IF v_price > 0 THEN
        SELECT credit_balance INTO v_user_credit FROM member WHERE member_id = NEW.member_id;
        IF v_user_credit < v_price THEN
            RAISE EXCEPTION 'Nedostatečný kredit pro vytvoření rezervace.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pre_reservation_check ON reservation;
CREATE TRIGGER trg_pre_reservation_check
BEFORE INSERT ON reservation
FOR EACH ROW EXECUTE FUNCTION fn_validate_reservation();


-- Automatické snížení kreditu po potvrzení rezervace
CREATE OR REPLACE FUNCTION fn_auto_deduct_credit()
RETURNS TRIGGER AS $$
BEGIN
    -- Snížíme kredit pouze při přechodu do stavu 'CONFIRMED'
    IF NEW.status = 'CONFIRMED' AND (OLD.status IS NULL OR OLD.status != 'CONFIRMED') THEN
        UPDATE member 
        SET credit_balance = credit_balance - (
            SELECT COALESCE(price, 0) FROM lesson_schedule WHERE lesson_schedule_id = NEW.lesson_schedule_id
        )
        WHERE member_id = NEW.member_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_after_reservation_confirmed ON reservation;
CREATE TRIGGER trg_after_reservation_confirmed
AFTER UPDATE OF status ON reservation
FOR EACH ROW EXECUTE FUNCTION fn_auto_deduct_credit();


-- ===========================================================================
-- 4. PROCEDURA (Transakční proces rezervace)
-- ===========================================================================

CREATE OR REPLACE PROCEDURE pr_secure_booking(
    p_member_id INT,
    p_schedule_id INT
)
AS $$
BEGIN
    INSERT INTO reservation (
        member_id, 
        lesson_schedule_id, 
        status, 
        timestamp_creation, 
        attendance
    ) VALUES (
        p_member_id, 
        p_schedule_id, 
        'CREATED', 
        NOW(), 
        false
    );
END;
$$ LANGUAGE plpgsql;
