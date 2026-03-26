-- ======================================================
-- DB analytika chodu posilovny a archivace
-- ======================================================

-- 1. Indexy: Podpořit tvorbu analytiky vhodnými indexy na tabulkách (např. řazení nad Created_At).
-- pro řazení poznámek podle času vytvoření
CREATE INDEX IX_TrainerNote_Created_At ON "Trainer_note" ("Created_at");

-- pro analýzu docházky (vstupy do tělocvičny)
CREATE INDEX IX_Attendance_Entrance ON "Attendance" ("Timestamp_entrance");

-- pro analytiku plateb
CREATE INDEX IX_Payment_Date ON "Payment" ("Date");

-- 2. Pohled (View): Statistiky návštěvnosti trenérů (Jaká byla vytíženost v daných časech za zpětné měsíce přes agregační JOIN funkce)
CREATE OR REPLACE VIEW View_Trainer_Stats AS
SELECT 
    e."Employee_ID",
    m."Name" || ' ' || m."Surname" AS Trainer_Name,
    COUNT(ls."Lesson_schedule_ID") AS Total_Lessons,
    SUM(ls."Duration") AS Total_Minutes,
    TO_CHAR(ls."Start_time", 'YYYY-MM') AS Month_Year
FROM "Employee" e
JOIN "Member" m ON e."Employee_ID" = m."Member_ID"
JOIN "Lesson_schedule" ls ON e."Employee_ID" = ls."Employee_ID"
GROUP BY e."Employee_ID", m."Name", m."Surname", TO_CHAR(ls."Start_time", 'YYYY-MM');

-- 3. Funkce: Výpis detailu člena do JSON formátu (Agregační sestavení objektu využívající postgreSQL např. json_build_object).
CREATE OR REPLACE FUNCTION fn_get_member_detail_json(p_member_id INT)
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT json_build_object(
            'id', "Member_ID",
            'name', "Name",
            'surname', "Surname",
            'email', "Email",
            'current_credits', "Credit_balance",
            'is_active', "Is_active"
        )
        FROM "Member"
        WHERE "Member_ID" = p_member_id
    );
END;
$$ LANGUAGE plpgsql;

-- 4. Procedura 1: Uzavření měsíčního vyúčtování (Měsíční uzávěrka lekcí a dopočet mezd/výnosů za daný čas).
CREATE OR REPLACE PROCEDURE pr_monthly_closure(p_month DATE)
LANGUAGE plpgsql AS $$
DECLARE
    v_total_revenue NUMERIC(10,2);
BEGIN
    -- Výpočet celkových příjmů z plateb za daný měsíc
    SELECT SUM("Amount") INTO v_total_revenue 
    FROM "Payment" 
    WHERE DATE_TRUNC('month', "Date") = DATE_TRUNC('month', p_month);

    RAISE NOTICE 'Měsíční uzávěrka pro %: Celková tržba % Kč', 
                 TO_CHAR(p_month, 'MM-YYYY'), 
                 COALESCE(v_total_revenue, 0);
END;
$$;

-- 5. Procedura 2: Archivace neaktivních členů (Procedura na přesun uživatelů starších jak 2 roky, kteří se nepřihlásili do archivní odkládací tabulky).
-- vytvoření archivační tabulky
CREATE TABLE IF NOT EXISTS "Member_Archive" (LIKE "Member" INCLUDING ALL);

CREATE OR REPLACE PROCEDURE pr_archive_inactive_members()
LANGUAGE plpgsql AS $$
BEGIN
    -- Kopírování členů starších 2 let bez aktivity
    INSERT INTO "Member_Archive"
    SELECT m.* FROM "Member" m
    LEFT JOIN "Attendance" a ON m."Member_ID" = a."Member_ID"
    GROUP BY m."Member_ID"
    HAVING MAX(a."Timestamp_entrance") < (CURRENT_DATE - INTERVAL '2 years')
       OR MAX(a."Timestamp_entrance") IS NULL;

    -- Odstranění z aktivní tabulky
    DELETE FROM "Member" 
    WHERE "Member_ID" IN (SELECT "Member_ID" FROM "Member_Archive");
    
    RAISE NOTICE 'Archivace dokončena.';
END;
$$;

-- 6. Trigger: Logování změn nad profilem (Aktivní history systém poslouchající na ON UPDATE, ukládající stav změny oprávnění např. do tabulky Audit_History).
-- Tabulka pro historii změn
CREATE TABLE IF NOT EXISTS "Audit_History" (
    "Audit_ID" SERIAL PRIMARY KEY,
    "Member_ID" INT,
    "Changed_At" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "Operation" TEXT,
    "Old_Data" JSONB,
    "New_Data" JSONB
);

-- Funkce triggeru
CREATE OR REPLACE FUNCTION tr_fn_audit_member_change()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO "Audit_History" ("Member_ID", "Operation", "Old_Data", "New_Data")
    VALUES (OLD."Member_ID", TG_OP, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- trigger
CREATE TRIGGER TR_Member_Audit
AFTER UPDATE ON "Member"
FOR EACH ROW
EXECUTE FUNCTION tr_fn_audit_member_change();



