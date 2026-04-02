// src/app/state.js
//
// Výchozí datová struktura (initial state) celé MMA aplikace – IR01.
//
// Tato funkce je "single source of truth" pro inicializaci stavu.
// Vrací vždy nový objekt (není to singleton) – store si ho převezme a zamkne do closure.
//
// Struktura je navržena dle TNPW2/README.md:
// - user: přihlášený uživatel, jeho role, zůstatek kreditů (atribut z DB: member.credit_balance)
// - activeReservations: pole aktuálních rezervací načtených z API (stav CREATED nebo CONFIRMED)
// - ui: technický stav UI (loading/ready/error) – oddělen od doménových dat

/**
 * Vytvoří a vrátí výchozí stav aplikace.
 * Volá se jednou při startu aplikace (nebo při resetu stavu, např. po odhlášení).
 *
 * @returns {Object} Výchozí stavový objekt.
 */
export function createInitialState() {
  return {

    // --- Uživatel (doménová data) ---
    // Výchozí stav = nepřihlášený host (GUEST).
    // Po úspěšném přihlášení dispatcher zaktualizuje role, userId, token a name.
    user: {
      role: 'GUEST',      // Možné hodnoty: GUEST | MEMBER | TRAINER (dle account.role v DB)
      userId: null,       // ID záznamu v tabulce 'member' nebo 'employee'
      token: null,        // JWT token nebo jiný session identifikátor (uložen v localStorage)
      name: null,         // Celé jméno uživatele (member.name + member.surname)
      creditBalance: 0,   // Zůstatek kreditů (odpovídá member.credit_balance v DB)
    },

    // --- Aktivní rezervace (doménová data) ---
    // Pole objektů rezervací s aktuálním stavem CREATED nebo CONFIRMED.
    // Naplní se po přihlášení uživatele voláním API (IR03 – asynchronní vrstva).
    // Každý objekt zde odpovídá řádku z tabulky 'reservation' + přidaná data lekce.
    activeReservations: [],

    // --- UI stav (technický stav) ---
    // Oddělen od doménových dat záměrně – slouží výhradně pro renderovací logiku (IR06).
    // Žádná business logika nesmí záviset na hodnotě ui.status.
    ui: {
      status: 'LOADING',        // LOADING | READY | ERROR – stav načítání aplikace
      errorMessage: null,       // Textová chybová hláška (null = žádná chyba)
    },

  };
}
