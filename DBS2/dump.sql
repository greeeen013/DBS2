--
-- PostgreSQL database dump
--

\restrict a6VL4KTYcUDPkhJoeIRAFcxCvuOSOlGi4wWswawfYvdO5bnNcXGR5Rw1rgJhx9P

-- Dumped from database version 16.12 (Debian 16.12-1.pgdg13+1)
-- Dumped by pg_dump version 16.12 (Debian 16.12-1.pgdg13+1)

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
    lesson_type_id smallint NOT NULL
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
-- Name: lesson_template; Type: TABLE; Schema: public; Owner: admin_dbs2
--

CREATE TABLE public.lesson_template (
    description text,
    duration smallint NOT NULL,
    maximum_capacity smallint NOT NULL,
    name character varying(200) NOT NULL,
    price numeric(10,2) NOT NULL,
    lesson_template_id integer DEFAULT nextval(('"lesson_template_lesson_template_id_seq"'::text)::regclass) NOT NULL,
    lesson_type_id smallint NOT NULL
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
    password_hash character varying(200),
    role character varying(50) DEFAULT 'member'::character varying NOT NULL,
    member_id integer DEFAULT nextval(('"member_member_id_seq"'::text)::regclass) NOT NULL,
    account_id integer
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
    payment_id integer,
    reservation_id integer
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
    tariff_id smallint DEFAULT nextval(('"tariff_tariff_id_seq"'::text)::regclass) NOT NULL
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
\.


--
-- Data for Name: lesson_schedule; Type: TABLE DATA; Schema: public; Owner: admin_dbs2
--

COPY public.lesson_schedule (description, duration, end_time, is_private, maximum_capacity, name, price, start_time, status, lesson_schedule_id, employee_id, lesson_template_id, lesson_type_id) FROM stdin;
\.


--
-- Data for Name: lesson_template; Type: TABLE DATA; Schema: public; Owner: admin_dbs2
--

COPY public.lesson_template (description, duration, maximum_capacity, name, price, lesson_template_id, lesson_type_id) FROM stdin;
\.


--
-- Data for Name: lesson_type; Type: TABLE DATA; Schema: public; Owner: admin_dbs2
--

COPY public.lesson_type (description, name, lesson_type_id) FROM stdin;
\.


--
-- Data for Name: lesson_type_tariff; Type: TABLE DATA; Schema: public; Owner: admin_dbs2
--

COPY public.lesson_type_tariff (tariff_id, lesson_type_id) FROM stdin;
\.


--
-- Data for Name: member; Type: TABLE DATA; Schema: public; Owner: admin_dbs2
--

COPY public.member (credit_balance, email, entry_token, first_attendance, is_active, name, phone_number, photo, surname, password_hash, role, member_id, account_id) FROM stdin;
0	asd@asd.cz	2a21fb16-fdc4-429e-8152-f85572ec2072	\N	\N	asd	\N	\N	dsa	$2b$12$M3k442yRkqHwJcubd.g60eHgtyT/W7X/3dpKuZ3WELMXDiVPV2jqG	member	1	\N
0	green013@post.cz	3a259629-c7f1-420c-80e9-8f9106139db6	\N	\N	jan	\N	\N	pospisil	$2b$12$50yq9WFyJdmy1YNCInN1MOKeeYcUMMRnlue0JJ6mUb2OKiunJbGpm	admin	2	\N
0	honzapospa1@seznam.cz	93b08e50-07d1-4868-8fba-3524d1c66f81	\N	\N	jan	\N	\N	pospisil	$2b$12$K3/lTFg0tkfl3aa/JPhXOeCUTJIycOOcbu1ZiEjeDzi3ojQw3LBuK	trainer	3	\N
\.


--
-- Data for Name: membership; Type: TABLE DATA; Schema: public; Owner: admin_dbs2
--

COPY public.membership (creation_date, is_auto_renewal, valid_from, valid_to, membership_id, member_id, tariff_id) FROM stdin;
\.


--
-- Data for Name: payment; Type: TABLE DATA; Schema: public; Owner: admin_dbs2
--

COPY public.payment (amount, date, payment_details, payment_type, status, payment_id, discount_code_id, member_id, membership_id) FROM stdin;
200.00	2026-04-09 11:49:28.129251+00	\N	CARD	PENDING	1	\N	1	\N
\.


--
-- Data for Name: reservation; Type: TABLE DATA; Schema: public; Owner: admin_dbs2
--

COPY public.reservation (attendance, guest_name, note, status, timestamp_creation, timestamp_change, reservation_id, member_id, lesson_schedule_id) FROM stdin;
\.


--
-- Data for Name: reservation_payment; Type: TABLE DATA; Schema: public; Owner: admin_dbs2
--

COPY public.reservation_payment (payment_id, reservation_id) FROM stdin;
\.


--
-- Data for Name: tariff; Type: TABLE DATA; Schema: public; Owner: admin_dbs2
--

COPY public.tariff (description, name, price, tariff_id) FROM stdin;
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

SELECT pg_catalog.setval('public.lesson_schedule_lesson_schedule_id_seq', 1, true);


--
-- Name: lesson_template_lesson_template_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin_dbs2
--

SELECT pg_catalog.setval('public.lesson_template_lesson_template_id_seq', 1, false);


--
-- Name: lesson_type_lesson_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin_dbs2
--

SELECT pg_catalog.setval('public.lesson_type_lesson_type_id_seq', 1, false);


--
-- Name: member_member_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin_dbs2
--

SELECT pg_catalog.setval('public.member_member_id_seq', 3, true);


--
-- Name: membership_membership_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin_dbs2
--

SELECT pg_catalog.setval('public.membership_membership_id_seq', 1, false);


--
-- Name: payment_payment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin_dbs2
--

SELECT pg_catalog.setval('public.payment_payment_id_seq', 1, true);


--
-- Name: reservation_reservation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin_dbs2
--

SELECT pg_catalog.setval('public.reservation_reservation_id_seq', 1, false);


--
-- Name: tariff_tariff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin_dbs2
--

SELECT pg_catalog.setval('public.tariff_tariff_id_seq', 1, false);


--
-- Name: trainer_note_trainer_note_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin_dbs2
--

SELECT pg_catalog.setval('public.trainer_note_trainer_note_id_seq', 1, false);


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
-- PostgreSQL database dump complete
--

\unrestrict a6VL4KTYcUDPkhJoeIRAFcxCvuOSOlGi4wWswawfYvdO5bnNcXGR5Rw1rgJhx9P

