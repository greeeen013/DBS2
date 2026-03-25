// Unit testy pro createInitialState() – IR01.
// Ověřují, že výchozí stav aplikace odpovídá specifikaci v TNPW2/README.md.
//
// Testy záměrně nepoužívají DOM, render ani síťová volání –
// testujeme čistou datovou strukturu (pure function).

import { createInitialState } from '../../src/app/state.js';
import { assert } from '../support/assert.mjs';

/**
 * Testovací sada pro výchozí stav aplikace.
 * Každý assert ověřuje jeden konkrétní požadavek z IR01 specifikace.
 */
export function testInitialState() {
  console.log('\n[IR01] Testy výchozího stavu (createInitialState):');

  const state = createInitialState();

  // --- Uživatel ---
  // Nepřihlášený uživatel musí mít roli GUEST.
  assert(state.user.role === 'GUEST', 'user.role je GUEST (nepřihlášený uživatel)');

  // Žádný token při startu – uživatel ještě neprošel přihlášením.
  assert(state.user.token === null, 'user.token je null při startu aplikace');

  // Zůstatek kreditů musí být nula (odpovídá member.credit_balance DEFAULT 0 v DB).
  assert(state.user.creditBalance === 0, 'user.creditBalance je 0 (výchozí zůstatek)');

  // userId není vyplněno – GUEST nemá přiřazený účet.
  assert(state.user.userId === null, 'user.userId je null pro GUEST');

  // --- Aktivní rezervace ---
  // Pole musí existovat a být prázdné – rezervace se načítají až po přihlášení.
  assert(Array.isArray(state.activeReservations), 'activeReservations je pole');
  assert(state.activeReservations.length === 0, 'activeReservations je prázdné při startu');

  // --- UI stav ---
  // Aplikace se spouští ve stavu LOADING (čeká na inicializaci – whoAmI call).
  assert(state.ui.status === 'LOADING', 'ui.status je LOADING při startu aplikace');

  // Žádná chybová zpráva při čistém start.
  assert(state.ui.errorMessage === null, 'ui.errorMessage je null (žádná chyba při startu)');
}
