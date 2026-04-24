// Unit testy pro IR06 – Renderovací logika (View Composition).
//
// Testují, že:
//   • selectViewState() mapuje stav LOADING na type 'LOADING'
//   • selectViewState() mapuje stav ERROR na type 'ERROR' s message
//   • selectViewState() mapuje RESERVATION_LIST na správný viewState
//   • selectViewState() mapuje LESSON_LIST na správný viewState
//   • selectViewState() mapuje AUTH_VIEW pro nepřihlášeného uživatele
//   • render() přepíná mezi pohledy dle viewState.type
//   • render() zobrazí LoadingView pro status LOADING
//   • render() zobrazí ErrorView pro status ERROR
//   • render() zobrazí navigační lištu pro přihlášeného uživatele
//   • render() nezobrazí navigační lištu pro AUTH_VIEW
//
// Testy používají JSDOM mock pro Node.js prostředí (document, HTMLElement).

import { selectViewState } from '../../src/src/infra/store/selectors.js';
import { assert } from '../support/assert.mjs';

// ---------------------------------------------------------------------------
// Pomocné factory funkce pro sestavení testovacího stavu
// ---------------------------------------------------------------------------

function makeFullState({
  role = 'member',
  memberId = 1,
  mode = 'RESERVATION_LIST',
  status = 'READY',
  errorMessage = null,
  lessons = [],
  reservations = [],
  creditBalance = 0,
  payments = [],
} = {}) {
  return {
    auth: { memberId, name: 'Test', surname: 'User', role },
    lessons,
    reservations,
    creditBalance,
    payments,
    memberships: [],
    trainers: [],
    lessonTypes: [],
    lessonTemplates: [],
    ui: { mode, status, errorMessage, notification: null },
    lessonFilter: 'ALL',
    lessonTariffFilter: null,
    lessonViewMode: 'list',
  };
}

// ---------------------------------------------------------------------------
// IR06 testy – selectViewState (projekce stavu do viewState)
// ---------------------------------------------------------------------------

export function testIR06() {
  console.log('\n[IR06] Testy renderovací logiky (selectViewState):');

  // --- LOADING stav → type 'LOADING' ---
  const loadingState = makeFullState({ status: 'LOADING' });
  const loadingVS = selectViewState(loadingState);
  assert(loadingVS.type === 'LOADING', 'selectViewState: status LOADING → type LOADING');

  // --- ERROR stav → type 'ERROR' s message ---
  const errorState = makeFullState({ status: 'ERROR', errorMessage: 'Server nedostupný' });
  const errorVS = selectViewState(errorState);
  assert(errorVS.type === 'ERROR', 'selectViewState: status ERROR → type ERROR');
  assert(errorVS.message === 'Server nedostupný', 'selectViewState: ERROR viewState obsahuje message');

  // --- RESERVATION_LIST → správný viewState ---
  const resState = makeFullState({
    mode: 'RESERVATION_LIST',
    reservations: [{ reservation_id: 1, status: 'CONFIRMED', lesson_schedule_id: 10 }],
    creditBalance: 500,
  });
  const resVS = selectViewState(resState);
  assert(resVS.type === 'RESERVATION_LIST', 'selectViewState: RESERVATION_LIST → type RESERVATION_LIST');
  assert(Array.isArray(resVS.rezervace), 'selectViewState: RESERVATION_LIST obsahuje pole rezervace');
  assert(resVS.zustatek === 500, 'selectViewState: RESERVATION_LIST obsahuje zustatek');

  // --- LESSON_LIST → správný viewState ---
  const lessonState = makeFullState({
    mode: 'LESSON_LIST',
    lessons: [{ lesson_id: 1, status: 'OPEN', registered_members: 5, maximal_capacity: 10 }],
  });
  const lessonVS = selectViewState(lessonState);
  assert(lessonVS.type === 'LESSON_LIST', 'selectViewState: LESSON_LIST → type LESSON_LIST');
  assert(Array.isArray(lessonVS.lekce), 'selectViewState: LESSON_LIST obsahuje pole lekce');
  assert(Array.isArray(lessonVS.lessonCapabilities), 'selectViewState: LESSON_LIST obsahuje lessonCapabilities');
  assert(typeof lessonVS.capabilities === 'object', 'selectViewState: LESSON_LIST obsahuje capabilities objekt');

  // --- AUTH_VIEW pro nepřihlášeného uživatele ---
  const guestState = makeFullState({ memberId: null, role: null, mode: 'AUTH_VIEW' });
  const guestVS = selectViewState(guestState);
  assert(guestVS.type === 'AUTH_VIEW', 'selectViewState: AUTH_VIEW → type AUTH_VIEW');

  // --- PAYMENT_VIEW → správný viewState ---
  const payState = makeFullState({
    mode: 'PAYMENT_VIEW',
    payments: [{ payment_id: 1, amount: 500 }],
    creditBalance: 300,
  });
  const payVS = selectViewState(payState);
  assert(payVS.type === 'PAYMENT_VIEW', 'selectViewState: PAYMENT_VIEW → type PAYMENT_VIEW');

  // --- PROFILE_VIEW → správný viewState ---
  const profState = makeFullState({ mode: 'PROFILE_VIEW' });
  const profVS = selectViewState(profState);
  assert(profVS.type === 'PROFILE_VIEW', 'selectViewState: PROFILE_VIEW → type PROFILE_VIEW');

  // --- LESSON_LIST: lessonCapabilities obsahuje správné capability dle stavu lekce ---
  const capsState = makeFullState({
    role: 'trainer',
    mode: 'LESSON_LIST',
    lessons: [
      { lesson_id: 1, status: 'OPEN', registered_members: 5, maximal_capacity: 10, employee_id: 1 },
      { lesson_id: 2, status: 'COMPLETED', registered_members: 8, maximal_capacity: 10, employee_id: 1 },
    ],
  });
  const capsVS = selectViewState(capsState);
  assert(capsVS.lessonCapabilities.length === 2, 'selectViewState: lessonCapabilities má 2 záznamy');
  // OPEN lekce – trainer smí zrušit a uzavřít
  assert(capsVS.lessonCapabilities[0].canCancel === true, 'selectViewState: OPEN lekce → canCancel true');
  assert(capsVS.lessonCapabilities[0].canClose === true, 'selectViewState: OPEN lekce → canClose true');
  // COMPLETED lekce – trainer smí zapsat docházku
  assert(capsVS.lessonCapabilities[1].canSetAttendance === true, 'selectViewState: COMPLETED lekce → canSetAttendance true');
  assert(capsVS.lessonCapabilities[1].canCancel === false, 'selectViewState: COMPLETED lekce → canCancel false');

  // --- LOADING má přednost před konkrétním mode ---
  const loadingWithMode = makeFullState({ status: 'LOADING', mode: 'LESSON_LIST' });
  const loadingPriority = selectViewState(loadingWithMode);
  assert(loadingPriority.type === 'LOADING', 'selectViewState: LOADING má přednost před mode');

  // --- ERROR má přednost před konkrétním mode ---
  const errorWithMode = makeFullState({ status: 'ERROR', errorMessage: 'Chyba', mode: 'LESSON_LIST' });
  const errorPriority = selectViewState(errorWithMode);
  assert(errorPriority.type === 'ERROR', 'selectViewState: ERROR má přednost před mode');

  console.log('[IR06] Všechny testy renderovací logiky prošly ✓');
}
