// src/app/constants.js
//
// Konstanty pro akce (action types) celé MMA aplikace.
//
// Proč konstanty místo plain stringů?
// Pokud bychom použili raw stringy kdekoliv v kódu, překlep by způsobil
// tiché selhání bez chybové zprávy. Takhle JS/IDE upozorní na neexistující proměnnou.
//
// Konvence pojmenování: SCREAMING_SNAKE_CASE – standardní pro action types.

// --- Autentizace (IR08 je owner, ale akce jsou sdílené) ---
export const ENTER_LOGIN   = 'ENTER_LOGIN';    // Přechod na zobrazení přihlášení
export const SUBMIT_LOGIN  = 'SUBMIT_LOGIN';   // Odeslání přihlašovacího formuláře
export const LOGOUT        = 'LOGOUT';         // Odhlášení uživatele
export const APP_INIT      = 'APP_INIT';       // Inicializace aplikace po načtení stránky

// --- Navigace / pohledy ---
export const ENTER_SCHEDULE    = 'ENTER_SCHEDULE';     // Zobrazení rozvrhu lekcí
export const ENTER_PROFILE     = 'ENTER_PROFILE';      // Zobrazení profilu uživatele
export const ENTER_RESERVATIONS = 'ENTER_RESERVATIONS'; // Zobrazení seznamu rezervací

// --- Rezervace (Student A – business entita Reservation) ---
export const MAKE_RESERVATION    = 'MAKE_RESERVATION';    // Uživatel se chce přihlásit na lekci
export const CONFIRM_RESERVATION = 'CONFIRM_RESERVATION'; // Systém potvrdil rezervaci (platba OK)
export const CANCEL_RESERVATION  = 'CANCEL_RESERVATION';  // Uživatel nebo trenér zrušil rezervaci
export const RESERVATION_ATTENDED = 'RESERVATION_ATTENDED'; // Člen se fyzicky dostavil na lekci

// --- Platby (Student A – business entita Payment) ---
export const TOP_UP_CREDIT  = 'TOP_UP_CREDIT';   // Dobití kreditů na účet
export const BUY_TARIFF     = 'BUY_TARIFF';      // Nákup měsíčního tarifu/permanentky
export const TOGGLE_AUTO_RENEWAL = 'TOGGLE_AUTO_RENEWAL'; // Zapnutí/vypnutí auto-obnovy tarifu

// --- Lekce (Student B – business entita Scheduled_Lesson) ---
export const CREATE_LESSON  = 'CREATE_LESSON';   // Trenér vytvoří novou lekci v rozvrhu
export const CANCEL_LESSON  = 'CANCEL_LESSON';   // Trenér zruší lekci (kaskádně stornuje rezervace)
export const UPDATE_CAPACITY = 'UPDATE_CAPACITY'; // Systém aktualizuje počet obsazených míst

// --- UI stavy (IR01 – technické interní stavy, ne business akce) ---
export const UI_SET_LOADING = 'UI_SET_LOADING';  // Přechod UI do stavu načítání
export const UI_SET_READY   = 'UI_SET_READY';    // Přechod UI do stavu připraven
export const UI_SET_ERROR   = 'UI_SET_ERROR';    // Přechod UI do stavu chyby
