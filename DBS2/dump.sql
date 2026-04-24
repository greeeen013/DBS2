--
-- PostgreSQL database dump
--

\restrict 1cAf1ZWFiTD3PeN3mdJA6bm4UgQKgMpZgJaaMgjSbFhdJKPl0nXcmin88f8M4DE

-- Dumped from database version 16.13 (Debian 16.13-1.pgdg13+1)
-- Dumped by pg_dump version 16.13 (Debian 16.13-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: reservationstatus; Type: TYPE; Schema: public; Owner: admin_dbs2
--

CREATE TYPE public.reservationstatus AS ENUM (
    'CREATED',
    'CONFIRMED',
    'PAID',
    'CANCELLED',
    'ATTENDED',
    'COMPLETED'
);


ALTER TYPE public.reservationstatus OWNER TO admin_dbs2;

--
-- Name: fn_auto_deduct_credit(); Type: FUNCTION; Schema: public; Owner: admin_dbs2
--

CREATE FUNCTION public.fn_auto_deduct_credit() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.fn_auto_deduct_credit() OWNER TO admin_dbs2;

--
-- Name: fn_check_lesson_capacity(integer); Type: FUNCTION; Schema: public; Owner: admin_dbs2
--

CREATE FUNCTION public.fn_check_lesson_capacity(p_lesson_id integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.fn_check_lesson_capacity(p_lesson_id integer) OWNER TO admin_dbs2;

--
-- Name: fn_get_member_details_json(integer); Type: FUNCTION; Schema: public; Owner: admin_dbs2
--

CREATE FUNCTION public.fn_get_member_details_json(p_member_id integer) RETURNS json
    LANGUAGE sql
    AS $$
    SELECT row_to_json(t)
    FROM (
        SELECT member_id, name, surname, email, credit_balance, role, phone_number
        FROM member
        WHERE member_id = p_member_id
    ) t;
$$;


ALTER FUNCTION public.fn_get_member_details_json(p_member_id integer) OWNER TO admin_dbs2;

--
-- Name: fn_get_tariff_price(integer, numeric); Type: FUNCTION; Schema: public; Owner: admin_dbs2
--

CREATE FUNCTION public.fn_get_tariff_price(p_tariff_id integer, p_discount_percent numeric DEFAULT 0) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_price NUMERIC;
BEGIN
    SELECT price INTO v_price FROM tariff WHERE tariff_id = p_tariff_id;
    IF v_price IS NULL THEN
        RAISE EXCEPTION 'Tarif % nenalezen', p_tariff_id;
    END IF;
    RETURN ROUND(v_price * (1 - p_discount_percent / 100), 2);
END;
$$;


ALTER FUNCTION public.fn_get_tariff_price(p_tariff_id integer, p_discount_percent numeric) OWNER TO admin_dbs2;

--
-- Name: fn_validate_reservation(); Type: FUNCTION; Schema: public; Owner: admin_dbs2
--

CREATE FUNCTION public.fn_validate_reservation() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.fn_validate_reservation() OWNER TO admin_dbs2;

--
-- Name: pr_archive_inactive_members(); Type: PROCEDURE; Schema: public; Owner: admin_dbs2
--

CREATE PROCEDURE public.pr_archive_inactive_members()
    LANGUAGE plpgsql
    AS $$
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


ALTER PROCEDURE public.pr_archive_inactive_members() OWNER TO admin_dbs2;

--
-- Name: pr_close_monthly_billing(); Type: PROCEDURE; Schema: public; Owner: admin_dbs2
--

CREATE PROCEDURE public.pr_close_monthly_billing()
    LANGUAGE plpgsql
    AS $$
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


ALTER PROCEDURE public.pr_close_monthly_billing() OWNER TO admin_dbs2;

--
-- Name: pr_secure_booking(integer, integer); Type: PROCEDURE; Schema: public; Owner: admin_dbs2
--

CREATE PROCEDURE public.pr_secure_booking(IN p_member_id integer, IN p_schedule_id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO reservation (member_id, lesson_schedule_id, status, timestamp_creation, attendance)
    VALUES (p_member_id, p_schedule_id, 'CREATED', NOW(), false);
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Rezervaci se nepodařilo vytvořit: %', SQLERRM;
END;
$$;


ALTER PROCEDURE public.pr_secure_booking(IN p_member_id integer, IN p_schedule_id integer) OWNER TO admin_dbs2;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: public; Owner: admin_dbs2
--

CREATE TABLE public.account (
    account_name character varying(200),
    is_active boolean,
    is_blocked boolean,
    password text,
    role character varying(50),
    account_id integer DEFAULT nextval(('"account_account_id_seq"'::text)::regclass) NOT NULL
);


ALTER TABLE public.account OWNER TO admin_dbs2;

--
-- Name: account_account_id_seq; Type: SEQUENCE; Schema: public; Owner: admin_dbs2
--

CREATE SEQUENCE public.account_account_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.account_account_id_seq OWNER TO admin_dbs2;

--
-- Name: address; Type: TABLE; Schema: public; Owner: admin_dbs2
--

CREATE TABLE public.address (
    apartment_number smallint,
    city character varying(200) NOT NULL,
    house_number smallint NOT NULL,
    postal_code character varying(10) NOT NULL,
    region character varying(200),
    state character varying(200) NOT NULL,
    street character varying(200),
    address_id integer DEFAULT nextval(('"address_address_id_seq"'::text)::regclass) NOT NULL,
    employee_id integer,
    member_id integer,
    CONSTRAINT chk_address_owner CHECK (((employee_id IS NOT NULL) OR (member_id IS NOT NULL)))
);


ALTER TABLE public.address OWNER TO admin_dbs2;

--
-- Name: address_address_id_seq; Type: SEQUENCE; Schema: public; Owner: admin_dbs2
--

CREATE SEQUENCE public.address_address_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.address_address_id_seq OWNER TO admin_dbs2;

--
-- Name: attendance; Type: TABLE; Schema: public; Owner: admin_dbs2
--

CREATE TABLE public.attendance (
    entry_type character varying(50),
    timestamp_entrance timestamp without time zone NOT NULL,
    timestamp_exit timestamp without time zone,
    attendance_id integer DEFAULT nextval(('"attendance_attendance_id_seq"'::text)::regclass) NOT NULL,
    member_id integer
);


ALTER TABLE public.attendance OWNER TO admin_dbs2;

--
-- Name: attendance_attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: admin_dbs2
--

CREATE SEQUENCE public.attendance_attendance_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attendance_attendance_id_seq OWNER TO admin_dbs2;

--
-- Name: certificate; Type: TABLE; Schema: public; Owner: admin_dbs2
--

CREATE TABLE public.certificate (
    acquisition_date date,
    certificate_number smallint NOT NULL,
    description text,
    file_path text,
    name character varying(200) NOT NULL,
    publisher character varying(200),
    type character varying(200) NOT NULL,
    url character varying(500),
    valid_to date NOT NULL,
    certificate_id integer DEFAULT nextval(('"certificate_certificate_id_seq"'::text)::regclass) NOT NULL,
    employee_id integer
);


ALTER TABLE public.certificate OWNER TO admin_dbs2;

--
-- Name: certificate_certificate_id_seq; Type: SEQUENCE; Schema: public; Owner: admin_dbs2
--

CREATE SEQUENCE public.certificate_certificate_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.certificate_certificate_id_seq OWNER TO admin_dbs2;

--
-- Name: discount_code; Type: TABLE; Schema: public; Owner: admin_dbs2
--

CREATE TABLE public.discount_code (
    discount_percent numeric(10,2) NOT NULL,
    expire_date timestamp without time zone NOT NULL,
    name character varying(50) NOT NULL,
    discount_code_id smallint DEFAULT nextval(('"discount_code_discount_code_id_seq"'::text)::regclass) NOT NULL
);


ALTER TABLE public.discount_code OWNER TO admin_dbs2;

--
-- Name: discount_code_discount_code_id_seq; Type: SEQUENCE; Schema: public; Owner: admin_dbs2
--

CREATE SEQUENCE public.discount_code_discount_code_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.discount_code_discount_code_id_seq OWNER TO admin_dbs2;

--
-- Name: employee; Type: TABLE; Schema: public; Owner: admin_dbs2
--

CREATE TABLE public.employee (
    bank_account_number character varying(34) NOT NULL,
    end_date date,
    "position" character varying(200) NOT NULL,
    role character varying(200),
    start_date date NOT NULL,
    type_of_empoyment character varying(50) NOT NULL,
    employee_id integer DEFAULT nextval(('"employee_employee_id_seq"'::text)::regclass) NOT NULL
);


ALTER TABLE public.employee OWNER TO admin_dbs2;

--
-- Name: employee_employee_id_seq; Type: SEQUENCE; Schema: public; Owner: admin_dbs2
--

CREATE SEQUENCE public.employee_employee_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_employee_id_seq OWNER TO admin_dbs2;

--
-- Name: lesson_schedule; Type: TABLE; Schema: public; Owner: admin_dbs2
--

CREATE TABLE public.lesson_schedule (
    description text,
    duration smallint NOT NULL,
    end_time timestamp without time zone,
    is_private boolean,
    maximum_capacity smallint NOT NULL,
    name character varying(200) NOT NULL,
    price numeric(10,2),
    start_time timestamp without time zone NOT NULL,
    status character varying(50) NOT NULL,
    lesson_schedule_id integer DEFAULT nextval(('"lesson_schedule_lesson_schedule_id_seq"'::text)::regclass) NOT NULL,
    employee_id integer NOT NULL,
    lesson_template_id integer,
    lesson_type_id smallint NOT NULL,
    required_tariff_ids text
);


ALTER TABLE public.lesson_schedule OWNER TO admin_dbs2;

--
-- Name: lesson_schedule_lesson_schedule_id_seq; Type: SEQUENCE; Schema: public; Owner: admin_dbs2
--

CREATE SEQUENCE public.lesson_schedule_lesson_schedule_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lesson_schedule_lesson_schedule_id_seq OWNER TO admin_dbs2;

--
-- Name: lesson_tariff; Type: TABLE; Schema: public; Owner: admin_dbs2
--

CREATE TABLE public.lesson_tariff (
    lesson_schedule_id integer NOT NULL,
    tariff_id integer NOT NULL
);


ALTER TABLE public.lesson_tariff OWNER TO admin_dbs2;

--
-- Name: lesson_template; Type: TABLE; Schema: public; Owner: admin_dbs2
--

CREATE TABLE public.lesson_template (
    description text,
    duration smallint NOT NULL,
    maximum_capacity smallint NOT NULL,
    name character varying(200) NOT NULL,
    price numeric(10,2) NOT NULL,
    lesson_template_id integer DEFAULT nextval(('"lesson_template_lesson_template_id_seq"'::text)::regclass) NOT NULL,
    lesson_type_id smallint NOT NULL,
    created_by integer,
    required_tariff_ids text
);


ALTER TABLE public.lesson_template OWNER TO admin_dbs2;

--
-- Name: lesson_template_lesson_template_id_seq; Type: SEQUENCE; Schema: public; Owner: admin_dbs2
--

CREATE SEQUENCE public.lesson_template_lesson_template_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lesson_template_lesson_template_id_seq OWNER TO admin_dbs2;

--
-- Name: lesson_template_tariff; Type: TABLE; Schema: public; Owner: admin_dbs2
--

CREATE TABLE public.lesson_template_tariff (
    lesson_template_id integer NOT NULL,
    tariff_id integer NOT NULL
);


ALTER TABLE public.lesson_template_tariff OWNER TO admin_dbs2;

--
-- Name: lesson_type; Type: TABLE; Schema: public; Owner: admin_dbs2
--

CREATE TABLE public.lesson_type (
    description text,
    name character varying(100) NOT NULL,
    lesson_type_id smallint DEFAULT nextval(('"lesson_type_lesson_type_id_seq"'::text)::regclass) NOT NULL
);


ALTER TABLE public.lesson_type OWNER TO admin_dbs2;

--
-- Name: lesson_type_lesson_type_id_seq; Type: SEQUENCE; Schema: public; Owner: admin_dbs2
--

CREATE SEQUENCE public.lesson_type_lesson_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lesson_type_lesson_type_id_seq OWNER TO admin_dbs2;

--
-- Name: lesson_type_tariff; Type: TABLE; Schema: public; Owner: admin_dbs2
--

CREATE TABLE public.lesson_type_tariff (
    tariff_id smallint NOT NULL,
    lesson_type_id smallint NOT NULL
);


ALTER TABLE public.lesson_type_tariff OWNER TO admin_dbs2;

--
-- Name: member; Type: TABLE; Schema: public; Owner: admin_dbs2
--

CREATE TABLE public.member (
    credit_balance integer DEFAULT 0 NOT NULL,
    email character varying(300),
    entry_token uuid DEFAULT gen_random_uuid() NOT NULL,
    first_attendance boolean,
    is_active boolean,
    name character varying(100) NOT NULL,
    phone_number character varying(50),
    photo text,
    surname character varying(100) NOT NULL,
    member_id integer DEFAULT nextval(('"member_member_id_seq"'::text)::regclass) NOT NULL,
    account_id integer,
    password_hash character varying(200),
    role character varying(50) DEFAULT 'member'::character varying NOT NULL
);


ALTER TABLE public.member OWNER TO admin_dbs2;

--
-- Name: member_member_id_seq; Type: SEQUENCE; Schema: public; Owner: admin_dbs2
--

CREATE SEQUENCE public.member_member_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.member_member_id_seq OWNER TO admin_dbs2;

--
-- Name: membership; Type: TABLE; Schema: public; Owner: admin_dbs2
--

CREATE TABLE public.membership (
    creation_date date NOT NULL,
    is_auto_renewal boolean,
    valid_from timestamp without time zone NOT NULL,
    valid_to timestamp without time zone NOT NULL,
    membership_id integer DEFAULT nextval(('"membership_membership_id_seq"'::text)::regclass) NOT NULL,
    member_id integer NOT NULL,
    tariff_id smallint NOT NULL
);


ALTER TABLE public.membership OWNER TO admin_dbs2;

--
-- Name: membership_membership_id_seq; Type: SEQUENCE; Schema: public; Owner: admin_dbs2
--

CREATE SEQUENCE public.membership_membership_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.membership_membership_id_seq OWNER TO admin_dbs2;

--
-- Name: payment; Type: TABLE; Schema: public; Owner: admin_dbs2
--

CREATE TABLE public.payment (
    amount numeric(10,2),
    date timestamp with time zone,
    payment_details text,
    payment_type character varying(50),
    status character varying(50),
    payment_id integer DEFAULT nextval(('"payment_payment_id_seq"'::text)::regclass) NOT NULL,
    discount_code_id smallint,
    member_id integer,
    membership_id integer
);


ALTER TABLE public.payment OWNER TO admin_dbs2;

--
-- Name: payment_payment_id_seq; Type: SEQUENCE; Schema: public; Owner: admin_dbs2
--

CREATE SEQUENCE public.payment_payment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payment_payment_id_seq OWNER TO admin_dbs2;

--
-- Name: reservation; Type: TABLE; Schema: public; Owner: admin_dbs2
--

CREATE TABLE public.reservation (
    attendance boolean,
    guest_name character varying(200),
    note text,
    status character varying(50) NOT NULL,
    timestamp_creation timestamp without time zone NOT NULL,
    timestamp_change timestamp without time zone,
    reservation_id integer DEFAULT nextval(('"reservation_reservation_id_seq"'::text)::regclass) NOT NULL,
    member_id integer NOT NULL,
    lesson_schedule_id integer NOT NULL
);


ALTER TABLE public.reservation OWNER TO admin_dbs2;

--
-- Name: reservation_payment; Type: TABLE; Schema: public; Owner: admin_dbs2
--

CREATE TABLE public.reservation_payment (
    payment_id integer NOT NULL,
    reservation_id integer NOT NULL
);


ALTER TABLE public.reservation_payment OWNER TO admin_dbs2;

--
-- Name: reservation_reservation_id_seq; Type: SEQUENCE; Schema: public; Owner: admin_dbs2
--

CREATE SEQUENCE public.reservation_reservation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reservation_reservation_id_seq OWNER TO admin_dbs2;

--
-- Name: tariff; Type: TABLE; Schema: public; Owner: admin_dbs2
--

CREATE TABLE public.tariff (
    description text,
    name character varying(100) NOT NULL,
    price numeric(10,2) NOT NULL,
    tariff_id smallint DEFAULT nextval(('"tariff_tariff_id_seq"'::text)::regclass) NOT NULL,
    duration_months smallint DEFAULT 1 NOT NULL,
    duration_days smallint DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.tariff OWNER TO admin_dbs2;

--
-- Name: tariff_tariff_id_seq; Type: SEQUENCE; Schema: public; Owner: admin_dbs2
--

CREATE SEQUENCE public.tariff_tariff_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tariff_tariff_id_seq OWNER TO admin_dbs2;

--
-- Name: trainer_note; Type: TABLE; Schema: public; Owner: admin_dbs2
--

CREATE TABLE public.trainer_note (
    created_at timestamp without time zone,
    text text,
    trainer_note_id integer DEFAULT nextval(('"trainer_note_trainer_note_id_seq"'::text)::regclass) NOT NULL,
    employee_id integer,
    member_id integer
);


ALTER TABLE public.trainer_note OWNER TO admin_dbs2;

--
-- Name: trainer_note_trainer_note_id_seq; Type: SEQUENCE; Schema: public; Owner: admin_dbs2
--

CREATE SEQUENCE public.trainer_note_trainer_note_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trainer_note_trainer_note_id_seq OWNER TO admin_dbs2;

--
-- Name: v_members_no_active_membership; Type: VIEW; Schema: public; Owner: admin_dbs2
--

CREATE VIEW public.v_members_no_active_membership AS
 SELECT m.member_id,
    m.name,
    m.surname,
    m.email,
    m.credit_balance,
    max(ms.valid_to) AS last_membership_expiry
   FROM (public.member m
     LEFT JOIN public.membership ms ON ((m.member_id = ms.member_id)))
  WHERE ((m.role)::text = 'member'::text)
  GROUP BY m.member_id, m.name, m.surname, m.email, m.credit_balance
 HAVING ((max(ms.valid_to) < now()) OR (max(ms.valid_to) IS NULL));


ALTER VIEW public.v_members_no_active_membership OWNER TO admin_dbs2;

--
-- Name: v_schedule_with_capacity; Type: VIEW; Schema: public; Owner: admin_dbs2
--

CREATE VIEW public.v_schedule_with_capacity AS
 SELECT ls.lesson_schedule_id,
    ls.name AS lesson_name,
    ls.start_time,
    ls.maximum_capacity,
    count(r.reservation_id) AS occupied_slots,
    (ls.maximum_capacity - count(r.reservation_id)) AS free_slots
   FROM (public.lesson_schedule ls
     LEFT JOIN public.reservation r ON (((ls.lesson_schedule_id = r.lesson_schedule_id) AND ((r.status)::text <> 'CANCELLED'::text))))
  GROUP BY ls.lesson_schedule_id, ls.name, ls.start_time, ls.maximum_capacity;


ALTER VIEW public.v_schedule_with_capacity OWNER TO admin_dbs2;

--
-- Name: v_trainer_stats; Type: VIEW; Schema: public; Owner: admin_dbs2
--

CREATE VIEW public.v_trainer_stats AS
 SELECT e.employee_id,
    m.name,
    m.surname,
    count(DISTINCT ls.lesson_schedule_id) AS total_lessons,
    count(r.reservation_id) AS total_reservations,
    count(
        CASE
            WHEN (r.attendance = true) THEN 1
            ELSE NULL::integer
        END) AS attended_count
   FROM (((public.employee e
     JOIN public.member m ON ((e.employee_id = m.member_id)))
     LEFT JOIN public.lesson_schedule ls ON ((e.employee_id = ls.employee_id)))
     LEFT JOIN public.reservation r ON (((ls.lesson_schedule_id = r.lesson_schedule_id) AND ((r.status)::text <> 'CANCELLED'::text))))
  GROUP BY e.employee_id, m.name, m.surname;


ALTER VIEW public.v_trainer_stats OWNER TO admin_dbs2;

--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: admin_dbs2
--

COPY public.account (account_name, is_active, is_blocked, password, role, account_id) FROM stdin;
\.


--
-- Data for Name: address; Type: TABLE DATA; Schema: public; Owner: admin_dbs2
--

COPY public.address (apartment_number, city, house_number, postal_code, region, state, street, address_id, employee_id, member_id) FROM stdin;
\.


--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: admin_dbs2
--

COPY public.attendance (entry_type, timestamp_entrance, timestamp_exit, attendance_id, member_id) FROM stdin;
\.


--
-- Data for Name: certificate; Type: TABLE DATA; Schema: public; Owner: admin_dbs2
--

COPY public.certificate (acquisition_date, certificate_number, description, file_path, name, publisher, type, url, valid_to, certificate_id, employee_id) FROM stdin;
\.


--
-- Data for Name: discount_code; Type: TABLE DATA; Schema: public; Owner: admin_dbs2
--

COPY public.discount_code (discount_percent, expire_date, name, discount_code_id) FROM stdin;
\.


--
-- Data for Name: employee; Type: TABLE DATA; Schema: public; Owner: admin_dbs2
--

COPY public.employee (bank_account_number, end_date, "position", role, start_date, type_of_empoyment, employee_id) FROM stdin;
CZ6508000000192000145399	\N	Administrátor	admin	2024-01-01	HPP	4
CZ6508000000192000145399	\N	Trenér MMA	trainer	2024-01-01	HPP	5
CZ6508000000192000145399	\N	Trenér MMA	trainer	2024-01-01	HPP	6
\.


--
-- Data for Name: lesson_schedule; Type: TABLE DATA; Schema: public; Owner: admin_dbs2
--

COPY public.lesson_schedule (description, duration, end_time, is_private, maximum_capacity, name, price, start_time, status, lesson_schedule_id, employee_id, lesson_template_id, lesson_type_id, required_tariff_ids) FROM stdin;
Úvodní lekce MMA pro nováčky.	60	\N	\N	15	MMA začátečníci – pondělí	250.00	2026-04-21 21:04:32.213259	OPEN	3	5	1	1	\N
Lekce pro začátečníky – základy stoje, pádu a obrany.	60	\N	\N	15	MMA začátečníci	\N	2026-04-21 17:05:00	CANCELLED	7	4	1	1	\N
Volný sparring a příprava bez pevné osnovy.	120	\N	\N	20	MMA – volný trénink	200.00	2026-04-27 20:04:32.213259	COMPLETED	6	6	\N	1	\N
Intenzivní trénink pro pokročilé kickboxery.	90	\N	\N	12	Kickbox pokročilí – středa	300.00	2026-04-23 22:04:32.213259	COMPLETED	4	6	2	2	\N
Zaměřeno na submisní techniky a přechody poloh.	75	\N	\N	10	BJJ – technika na zemi	\N	2026-04-21 21:10:00	COMPLETED	8	6	3	3	\N
Zaměřeno na submisní techniky a přechody poloh.	75	\N	\N	10	BJJ – technika na zemi	\N	2026-04-21 17:07:00	COMPLETED	9	6	3	3	\N
Technika submisí a přechodů poloh.	75	\N	\N	10	BJJ – technika	280.00	2026-04-25 23:04:32.213259	OPEN	5	5	3	3	\N
Zaměřeno na submisní techniky a přechody poloh.	75	\N	\N	10	BJJ – technika na zemi	\N	2026-04-24 10:13:00	OPEN	10	4	\N	3	\N
Lekce pro začátečníky – základy stoje, pádu a obrany.	60	\N	\N	15	MMA začátečníci	\N	2026-04-24 10:13:00	OPEN	11	5	1	1	\N
Lekce pro začátečníky – základy stoje, pádu a obrany.	60	\N	\N	15	MMA začátečníci	\N	2026-04-24 10:15:00	OPEN	12	5	1	1	\N
Proběhlá lekce – testuje se znovu otevření.	60	\N	\N	10	BJJ – minulý týden (dokončená)	280.00	2026-04-21 09:45:08.529928	COMPLETED	13	5	\N	3	\N
Zrušená lekce – testuje se znovu otevření.	90	\N	\N	12	Kickbox – zrušená lekce	300.00	2026-04-26 16:45:08.529928	CANCELLED	14	6	\N	2	\N
\.


--
-- Data for Name: lesson_tariff; Type: TABLE DATA; Schema: public; Owner: admin_dbs2
--

COPY public.lesson_tariff (lesson_schedule_id, tariff_id) FROM stdin;
\.


--
-- Data for Name: lesson_template; Type: TABLE DATA; Schema: public; Owner: admin_dbs2
--

COPY public.lesson_template (description, duration, maximum_capacity, name, price, lesson_template_id, lesson_type_id, created_by, required_tariff_ids) FROM stdin;
Lekce pro začátečníky – základy stoje, pádu a obrany.	60	15	MMA začátečníci	250.00	1	1	\N	\N
Intenzivní trénink kopů a kombinací pro pokročilé.	90	12	Kickbox pokročilí	300.00	2	2	\N	\N
Zaměřeno na submisní techniky a přechody poloh.	75	10	BJJ – technika na zemi	280.00	3	3	\N	\N
\.


--
-- Data for Name: lesson_template_tariff; Type: TABLE DATA; Schema: public; Owner: admin_dbs2
--

COPY public.lesson_template_tariff (lesson_template_id, tariff_id) FROM stdin;
\.


--
-- Data for Name: lesson_type; Type: TABLE DATA; Schema: public; Owner: admin_dbs2
--

COPY public.lesson_type (description, name, lesson_type_id) FROM stdin;
Smíšená bojová umění – kombinace úderů, kopů a wrestlingu.	MMA	1
Kontaktní sport kombinující box a kopání.	Kickbox	2
Brazilské jiu-jitsu – zápasnický styl zaměřený na techniku.	BJJ	3
\.


--
-- Data for Name: lesson_type_tariff; Type: TABLE DATA; Schema: public; Owner: admin_dbs2
--

COPY public.lesson_type_tariff (tariff_id, lesson_type_id) FROM stdin;
\.


--
-- Data for Name: member; Type: TABLE DATA; Schema: public; Owner: admin_dbs2
--

COPY public.member (credit_balance, email, entry_token, first_attendance, is_active, name, phone_number, photo, surname, member_id, account_id, password_hash, role) FROM stdin;
0	v5@v.cz	2ed48b98-03b1-4f5c-8d11-f354dc80ae22	\N	\N	jmeno	\N	\N	prijmeni	1	\N	$2b$12$qwGc3.voWLJwoFohgSZsa.fIskXAxd9NC9J/0TN5hNVSM.n2qWMoq	admin
0	asd@asd.asd	2489a10c-5b61-43bb-8eed-56b1f76941f9	\N	\N	asd	\N	\N	asd	3	\N	$2b$12$OhM3HsEU7YmJ5pS0aNpZ.ecxFelxjjR4r5Uaxl3pvCdoUddinVMCu	admin
0	admin@pretorian.cz	d9e99463-ad29-4530-95bd-dec56b8b59dc	\N	\N	Adam	\N	\N	Novák	4	\N	$2b$12$MZjnI5dPMXu55r21IpNmd.Y.9QzGe8AlSCVd622pCF3rJ5Lzojusy	admin
0	trener1@pretorian.cz	3c0a0fc3-b736-49c9-9db3-a90b39d323a8	\N	\N	Tomáš	\N	\N	Kovář	5	\N	$2b$12$Cxf1dankt2DbTyz/hHdkA.5y3T3jIoa9qFqDHA.aTU.a9Ys9kL/LG	trainer
0	trener2@pretorian.cz	e054bb86-284b-4453-94c8-af8daf10cde3	\N	\N	Jana	\N	\N	Horáková	6	\N	$2b$12$LfPsb2jURRfSYILqlLvsE.EcMWjPmE5fTaav.36v7C/7.Zard.nL2	trainer
300	clen2@pretorian.cz	8cbbbb51-877c-448b-9084-97203cf33158	\N	\N	Lucie	\N	\N	Marková	8	\N	$2b$12$qU2IbS1476zfBqexaOH/9OD.84oOWRe0VXo72qvEeLrTVuuhIq6LS	member
200	clen3@pretorian.cz	55bdca1d-9d92-4678-80c4-a23d33ece37a	\N	\N	Ondřej	\N	\N	Blažek	9	\N	$2b$12$59oz6Qz.sKojTBlm.fmPLu2jfUX/5VWE0dGhdzpx9HnZJ0I.akQnG	member
500	clen1@pretorian.cz	5aa7bf32-39f8-4f5b-b3fb-87c305342920	\N	\N	Petr	\N	\N	Svoboda	7	\N	$2b$12$70P.bZh4CBvMi2MuCfkcgePmFaUovgbv5adzfYAVtgQiRvKZNWM/G	member
\.


--
-- Data for Name: membership; Type: TABLE DATA; Schema: public; Owner: admin_dbs2
--

COPY public.membership (creation_date, is_auto_renewal, valid_from, valid_to, membership_id, member_id, tariff_id) FROM stdin;
2026-04-24	f	2026-04-24 09:45:08.548301	2026-05-24 09:45:08.548301	2	7	6
2026-04-24	f	2026-04-24 09:45:08.548301	2026-05-24 09:45:08.548301	3	8	6
\.


--
-- Data for Name: payment; Type: TABLE DATA; Schema: public; Owner: admin_dbs2
--

COPY public.payment (amount, date, payment_details, payment_type, status, payment_id, discount_code_id, member_id, membership_id) FROM stdin;
500.00	2026-04-24 09:45:08.554979+00	\N	CREDIT	COMPLETED	2	\N	7	2
500.00	2026-04-24 09:45:08.558532+00	\N	CREDIT	COMPLETED	3	\N	8	3
\.


--
-- Data for Name: reservation; Type: TABLE DATA; Schema: public; Owner: admin_dbs2
--

COPY public.reservation (attendance, guest_name, note, status, timestamp_creation, timestamp_change, reservation_id, member_id, lesson_schedule_id) FROM stdin;
\N	\N	\N	CANCELLED	2026-04-21 03:12:31.595266	2026-04-21 03:13:17.702881	1	7	3
\N	\N	\N	CANCELLED	2026-04-21 03:17:05.208723	2026-04-21 03:26:53.464591	2	7	5
\N	\N	\N	CANCELLED	2026-04-21 05:08:22.507564	2026-04-21 05:08:25.777799	3	7	3
\N	\N	\N	CANCELLED	2026-04-21 17:56:37.401225	\N	4	7	8
\N	\N	\N	CREATED	2026-04-21 18:16:28.462316	\N	6	7	3
t	\N	\N	CREATED	2026-04-21 18:16:24.609857	\N	5	7	9
\.


--
-- Data for Name: reservation_payment; Type: TABLE DATA; Schema: public; Owner: admin_dbs2
--

COPY public.reservation_payment (payment_id, reservation_id) FROM stdin;
\.


--
-- Data for Name: tariff; Type: TABLE DATA; Schema: public; Owner: admin_dbs2
--

COPY public.tariff (description, name, price, tariff_id, duration_months, duration_days, is_active) FROM stdin;
Měsíční permanentka – přístup na základní lekce.	Základní	500.00	6	1	0	t
Čtvrtletní permanentka pro pokročilé.	Pokročilý	1200.00	7	3	0	t
Roční permanentka – neomezený přístup.	Premium	4000.00	8	12	0	t
Stará nabídka – již neprodáváme.	Archivovaný tarif	400.00	9	1	0	f
\.


--
-- Data for Name: trainer_note; Type: TABLE DATA; Schema: public; Owner: admin_dbs2
--

COPY public.trainer_note (created_at, text, trainer_note_id, employee_id, member_id) FROM stdin;
\.


--
-- Name: account_account_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin_dbs2
--

SELECT pg_catalog.setval('public.account_account_id_seq', 1, false);


--
-- Name: address_address_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin_dbs2
--

SELECT pg_catalog.setval('public.address_address_id_seq', 1, false);


--
-- Name: attendance_attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin_dbs2
--

SELECT pg_catalog.setval('public.attendance_attendance_id_seq', 1, false);


--
-- Name: certificate_certificate_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin_dbs2
--

SELECT pg_catalog.setval('public.certificate_certificate_id_seq', 1, false);


--
-- Name: discount_code_discount_code_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin_dbs2
--

SELECT pg_catalog.setval('public.discount_code_discount_code_id_seq', 1, false);


--
-- Name: employee_employee_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin_dbs2
--

SELECT pg_catalog.setval('public.employee_employee_id_seq', 1, false);


--
-- Name: lesson_schedule_lesson_schedule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin_dbs2
--

SELECT pg_catalog.setval('public.lesson_schedule_lesson_schedule_id_seq', 14, true);


--
-- Name: lesson_template_lesson_template_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin_dbs2
--

SELECT pg_catalog.setval('public.lesson_template_lesson_template_id_seq', 3, true);


--
-- Name: lesson_type_lesson_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin_dbs2
--

SELECT pg_catalog.setval('public.lesson_type_lesson_type_id_seq', 3, true);


--
-- Name: member_member_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin_dbs2
--

SELECT pg_catalog.setval('public.member_member_id_seq', 9, true);


--
-- Name: membership_membership_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin_dbs2
--

SELECT pg_catalog.setval('public.membership_membership_id_seq', 3, true);


--
-- Name: payment_payment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin_dbs2
--

SELECT pg_catalog.setval('public.payment_payment_id_seq', 3, true);


--
-- Name: reservation_reservation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin_dbs2
--

SELECT pg_catalog.setval('public.reservation_reservation_id_seq', 1, false);


--
-- Name: tariff_tariff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin_dbs2
--

SELECT pg_catalog.setval('public.tariff_tariff_id_seq', 9, true);


--
-- Name: trainer_note_trainer_note_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin_dbs2
--

SELECT pg_catalog.setval('public.trainer_note_trainer_note_id_seq', 1, false);


--
-- Name: lesson_tariff lesson_tariff_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.lesson_tariff
    ADD CONSTRAINT lesson_tariff_pkey PRIMARY KEY (lesson_schedule_id, tariff_id);


--
-- Name: lesson_template_tariff lesson_template_tariff_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.lesson_template_tariff
    ADD CONSTRAINT lesson_template_tariff_pkey PRIMARY KEY (lesson_template_id, tariff_id);


--
-- Name: account pk_account; Type: CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT pk_account PRIMARY KEY (account_id);


--
-- Name: address pk_address; Type: CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.address
    ADD CONSTRAINT pk_address PRIMARY KEY (address_id);


--
-- Name: attendance pk_attendance; Type: CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT pk_attendance PRIMARY KEY (attendance_id);


--
-- Name: certificate pk_certificate; Type: CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.certificate
    ADD CONSTRAINT pk_certificate PRIMARY KEY (certificate_id);


--
-- Name: discount_code pk_discount_code; Type: CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.discount_code
    ADD CONSTRAINT pk_discount_code PRIMARY KEY (discount_code_id);


--
-- Name: employee pk_employee; Type: CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT pk_employee PRIMARY KEY (employee_id);


--
-- Name: lesson_schedule pk_lesson_schedule; Type: CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.lesson_schedule
    ADD CONSTRAINT pk_lesson_schedule PRIMARY KEY (lesson_schedule_id);


--
-- Name: lesson_template pk_lesson_template; Type: CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.lesson_template
    ADD CONSTRAINT pk_lesson_template PRIMARY KEY (lesson_template_id);


--
-- Name: lesson_type pk_lesson_type; Type: CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.lesson_type
    ADD CONSTRAINT pk_lesson_type PRIMARY KEY (lesson_type_id);


--
-- Name: lesson_type_tariff pk_lesson_type_tariff; Type: CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.lesson_type_tariff
    ADD CONSTRAINT pk_lesson_type_tariff PRIMARY KEY (tariff_id, lesson_type_id);


--
-- Name: member pk_member; Type: CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.member
    ADD CONSTRAINT pk_member PRIMARY KEY (member_id);


--
-- Name: membership pk_membership; Type: CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.membership
    ADD CONSTRAINT pk_membership PRIMARY KEY (membership_id);


--
-- Name: payment pk_payment; Type: CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT pk_payment PRIMARY KEY (payment_id);


--
-- Name: reservation pk_reservation; Type: CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT pk_reservation PRIMARY KEY (reservation_id);


--
-- Name: reservation_payment pk_reservation_payment_composite; Type: CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.reservation_payment
    ADD CONSTRAINT pk_reservation_payment_composite PRIMARY KEY (reservation_id, payment_id);


--
-- Name: tariff pk_tariff; Type: CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.tariff
    ADD CONSTRAINT pk_tariff PRIMARY KEY (tariff_id);


--
-- Name: trainer_note pk_trainer_note; Type: CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.trainer_note
    ADD CONSTRAINT pk_trainer_note PRIMARY KEY (trainer_note_id);


--
-- Name: idx_attendance_member; Type: INDEX; Schema: public; Owner: admin_dbs2
--

CREATE INDEX idx_attendance_member ON public.attendance USING btree (member_id);


--
-- Name: idx_lesson_schedule_start; Type: INDEX; Schema: public; Owner: admin_dbs2
--

CREATE INDEX idx_lesson_schedule_start ON public.lesson_schedule USING btree (start_time);


--
-- Name: idx_membership_member; Type: INDEX; Schema: public; Owner: admin_dbs2
--

CREATE INDEX idx_membership_member ON public.membership USING btree (member_id);


--
-- Name: idx_membership_valid_to; Type: INDEX; Schema: public; Owner: admin_dbs2
--

CREATE INDEX idx_membership_valid_to ON public.membership USING btree (valid_to);


--
-- Name: idx_reservation_lesson; Type: INDEX; Schema: public; Owner: admin_dbs2
--

CREATE INDEX idx_reservation_lesson ON public.reservation USING btree (lesson_schedule_id);


--
-- Name: idx_reservation_member; Type: INDEX; Schema: public; Owner: admin_dbs2
--

CREATE INDEX idx_reservation_member ON public.reservation USING btree (member_id);


--
-- Name: reservation trg_after_reservation_confirmed; Type: TRIGGER; Schema: public; Owner: admin_dbs2
--

CREATE TRIGGER trg_after_reservation_confirmed AFTER UPDATE OF status ON public.reservation FOR EACH ROW EXECUTE FUNCTION public.fn_auto_deduct_credit();


--
-- Name: reservation trg_pre_reservation_check; Type: TRIGGER; Schema: public; Owner: admin_dbs2
--

CREATE TRIGGER trg_pre_reservation_check BEFORE INSERT ON public.reservation FOR EACH ROW EXECUTE FUNCTION public.fn_validate_reservation();


--
-- Name: address fk_address_employee; Type: FK CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.address
    ADD CONSTRAINT fk_address_employee FOREIGN KEY (employee_id) REFERENCES public.employee(employee_id);


--
-- Name: address fk_address_member; Type: FK CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.address
    ADD CONSTRAINT fk_address_member FOREIGN KEY (member_id) REFERENCES public.member(member_id);


--
-- Name: attendance fk_attendance_member; Type: FK CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT fk_attendance_member FOREIGN KEY (member_id) REFERENCES public.member(member_id);


--
-- Name: certificate fk_certificate_employee; Type: FK CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.certificate
    ADD CONSTRAINT fk_certificate_employee FOREIGN KEY (employee_id) REFERENCES public.employee(employee_id);


--
-- Name: employee fk_employee_member; Type: FK CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT fk_employee_member FOREIGN KEY (employee_id) REFERENCES public.member(member_id);


--
-- Name: lesson_schedule fk_lesson_schedule_employee; Type: FK CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.lesson_schedule
    ADD CONSTRAINT fk_lesson_schedule_employee FOREIGN KEY (employee_id) REFERENCES public.employee(employee_id);


--
-- Name: lesson_schedule fk_lesson_schedule_lesson_template; Type: FK CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.lesson_schedule
    ADD CONSTRAINT fk_lesson_schedule_lesson_template FOREIGN KEY (lesson_template_id) REFERENCES public.lesson_template(lesson_template_id);


--
-- Name: lesson_schedule fk_lesson_schedule_lesson_type; Type: FK CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.lesson_schedule
    ADD CONSTRAINT fk_lesson_schedule_lesson_type FOREIGN KEY (lesson_type_id) REFERENCES public.lesson_type(lesson_type_id);


--
-- Name: lesson_template fk_lesson_template_lesson_type; Type: FK CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.lesson_template
    ADD CONSTRAINT fk_lesson_template_lesson_type FOREIGN KEY (lesson_type_id) REFERENCES public.lesson_type(lesson_type_id);


--
-- Name: lesson_type_tariff fk_lesson_type_tariff_lesson_type; Type: FK CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.lesson_type_tariff
    ADD CONSTRAINT fk_lesson_type_tariff_lesson_type FOREIGN KEY (lesson_type_id) REFERENCES public.lesson_type(lesson_type_id);


--
-- Name: lesson_type_tariff fk_lesson_type_tariff_tariff; Type: FK CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.lesson_type_tariff
    ADD CONSTRAINT fk_lesson_type_tariff_tariff FOREIGN KEY (tariff_id) REFERENCES public.tariff(tariff_id);


--
-- Name: lesson_tariff fk_lt_lesson; Type: FK CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.lesson_tariff
    ADD CONSTRAINT fk_lt_lesson FOREIGN KEY (lesson_schedule_id) REFERENCES public.lesson_schedule(lesson_schedule_id) ON DELETE CASCADE;


--
-- Name: lesson_tariff fk_lt_tariff; Type: FK CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.lesson_tariff
    ADD CONSTRAINT fk_lt_tariff FOREIGN KEY (tariff_id) REFERENCES public.tariff(tariff_id) ON DELETE CASCADE;


--
-- Name: lesson_template_tariff fk_ltt_tariff; Type: FK CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.lesson_template_tariff
    ADD CONSTRAINT fk_ltt_tariff FOREIGN KEY (tariff_id) REFERENCES public.tariff(tariff_id) ON DELETE CASCADE;


--
-- Name: lesson_template_tariff fk_ltt_template; Type: FK CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.lesson_template_tariff
    ADD CONSTRAINT fk_ltt_template FOREIGN KEY (lesson_template_id) REFERENCES public.lesson_template(lesson_template_id) ON DELETE CASCADE;


--
-- Name: member fk_member_account; Type: FK CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.member
    ADD CONSTRAINT fk_member_account FOREIGN KEY (account_id) REFERENCES public.account(account_id);


--
-- Name: membership fk_membership_member; Type: FK CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.membership
    ADD CONSTRAINT fk_membership_member FOREIGN KEY (member_id) REFERENCES public.member(member_id);


--
-- Name: membership fk_membership_tariff; Type: FK CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.membership
    ADD CONSTRAINT fk_membership_tariff FOREIGN KEY (tariff_id) REFERENCES public.tariff(tariff_id);


--
-- Name: payment fk_payment_discount_code; Type: FK CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT fk_payment_discount_code FOREIGN KEY (discount_code_id) REFERENCES public.discount_code(discount_code_id);


--
-- Name: payment fk_payment_member; Type: FK CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT fk_payment_member FOREIGN KEY (member_id) REFERENCES public.member(member_id);


--
-- Name: payment fk_payment_membership; Type: FK CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT fk_payment_membership FOREIGN KEY (membership_id) REFERENCES public.membership(membership_id);


--
-- Name: reservation fk_reservation_lesson_schedule; Type: FK CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT fk_reservation_lesson_schedule FOREIGN KEY (lesson_schedule_id) REFERENCES public.lesson_schedule(lesson_schedule_id);


--
-- Name: reservation fk_reservation_member; Type: FK CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT fk_reservation_member FOREIGN KEY (member_id) REFERENCES public.member(member_id);


--
-- Name: reservation_payment fk_reservation_payment_payment; Type: FK CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.reservation_payment
    ADD CONSTRAINT fk_reservation_payment_payment FOREIGN KEY (payment_id) REFERENCES public.payment(payment_id);


--
-- Name: reservation_payment fk_reservation_payment_reservation; Type: FK CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.reservation_payment
    ADD CONSTRAINT fk_reservation_payment_reservation FOREIGN KEY (reservation_id) REFERENCES public.reservation(reservation_id);


--
-- Name: trainer_note fk_trainer_note_employee; Type: FK CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.trainer_note
    ADD CONSTRAINT fk_trainer_note_employee FOREIGN KEY (employee_id) REFERENCES public.employee(employee_id);


--
-- Name: trainer_note fk_trainer_note_member; Type: FK CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.trainer_note
    ADD CONSTRAINT fk_trainer_note_member FOREIGN KEY (member_id) REFERENCES public.member(member_id);


--
-- Name: lesson_schedule lesson_schedule_lesson_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.lesson_schedule
    ADD CONSTRAINT lesson_schedule_lesson_template_id_fkey FOREIGN KEY (lesson_template_id) REFERENCES public.lesson_template(lesson_template_id) ON DELETE SET NULL;


--
-- Name: lesson_template lesson_template_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_dbs2
--

ALTER TABLE ONLY public.lesson_template
    ADD CONSTRAINT lesson_template_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.member(member_id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict 1cAf1ZWFiTD3PeN3mdJA6bm4UgQKgMpZgJaaMgjSbFhdJKPl0nXcmin88f8M4DE

