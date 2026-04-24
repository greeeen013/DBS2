// Unit testy pro IR03 – Asynchronní operace a side-effects (API vrstva).
//
// Testují, že:
//   • createReservationsApi() vrací objekt s metodami getAll, create, updateStatus
//   • createLessonsApi() vrací objekt s metodami getAll, create, updateStatus, getDetail atd.
//   • createPaymentsApi() vrací objekt s metodami getHistory, create, updateStatus, getBalance
//   • createAuthApi() vrací objekt s metodami login, register
//   • appInit() nastaví LOADING stav na začátku a READY po úspěšném načtení
//   • appInit() bez přihlášeného uživatele přesměruje na AUTH_VIEW
//   • appInit() při selhání API nastaví ERROR stav
//   • appInit() při 401 odpovědi automaticky odhlásí uživatele
//   • Akce (enrollLesson) správně volá api → aktualizuje store → nastaví notifikaci
//   • Akce při chybě API nastaví varovnou notifikaci místo pádu
//
// Testy nepoužívají síťová volání – API vrstva je mockovaná.

import { createReservationsApi } from '../../src/src/api/reservationsApi.js';
import { createLessonsApi } from '../../src/src/api/lessonsApi.js';
import { createPaymentsApi } from '../../src/src/api/paymentsApi.js';
import { createAuthApi } from '../../src/src/api/authApi.js';
import { appInit } from '../../src/src/app/appInit.js';
import { enrollLesson } from '../../src/src/app/actions/enrollLesson.js';
import { assert } from '../support/assert.mjs';

// ---------------------------------------------------------------------------
// Mock store – simuluje centrální store bez skutečné implementace
// ---------------------------------------------------------------------------
function createMockStore(initialState) {
  let state = initialState;
  return {
    getState: () => state,
    setState: (fn) => { state = fn(state); },
  };
}

// ---------------------------------------------------------------------------
// Mock localStorage – Node.js nemá localStorage, simulujeme ho
// ---------------------------------------------------------------------------
function createMockLocalStorage() {
  const data = {};
  return {
    getItem: (key) => data[key] ?? null,
    setItem: (key, val) => { data[key] = String(val); },
    removeItem: (key) => { delete data[key]; },
    _data: data,
  };
}

// ---------------------------------------------------------------------------
// IR03 – API factory testy (struktura rozhraní)
// ---------------------------------------------------------------------------
export async function testIR03() {
  console.log('\n[IR03] Testy asynchronní vrstvy (API factories + appInit):');

  // --- Reservations API factory vrací očekávané metody ---
  const resApi = createReservationsApi();
  assert(typeof resApi.getAll === 'function', 'reservationsApi: getAll je funkce');
  assert(typeof resApi.create === 'function', 'reservationsApi: create je funkce');
  assert(typeof resApi.updateStatus === 'function', 'reservationsApi: updateStatus je funkce');

  // --- Lessons API factory vrací očekávané metody ---
  const lesApi = createLessonsApi();
  assert(typeof lesApi.getAll === 'function', 'lessonsApi: getAll je funkce');
  assert(typeof lesApi.create === 'function', 'lessonsApi: create je funkce');
  assert(typeof lesApi.updateStatus === 'function', 'lessonsApi: updateStatus je funkce');
  assert(typeof lesApi.getDetail === 'function', 'lessonsApi: getDetail je funkce');
  assert(typeof lesApi.getTrainers === 'function', 'lessonsApi: getTrainers je funkce');
  assert(typeof lesApi.getTemplates === 'function', 'lessonsApi: getTemplates je funkce');
  assert(typeof lesApi.getLessonTypes === 'function', 'lessonsApi: getLessonTypes je funkce');
  assert(typeof lesApi.getAttendees === 'function', 'lessonsApi: getAttendees je funkce');
  assert(typeof lesApi.setAttendance === 'function', 'lessonsApi: setAttendance je funkce');
  assert(typeof lesApi.kickMember === 'function', 'lessonsApi: kickMember je funkce');

  // --- Payments API factory vrací očekávané metody ---
  const payApi = createPaymentsApi();
  assert(typeof payApi.getHistory === 'function', 'paymentsApi: getHistory je funkce');
  assert(typeof payApi.create === 'function', 'paymentsApi: create je funkce');
  assert(typeof payApi.updateStatus === 'function', 'paymentsApi: updateStatus je funkce');
  assert(typeof payApi.getBalance === 'function', 'paymentsApi: getBalance je funkce');

  // --- Auth API factory vrací očekávané metody ---
  const authApiObj = createAuthApi();
  assert(typeof authApiObj.login === 'function', 'authApi: login je funkce');
  assert(typeof authApiObj.register === 'function', 'authApi: register je funkce');

  // --- appInit: nepřihlášený uživatel → AUTH_VIEW ---
  const guestStore = createMockStore({
    auth: { memberId: null, name: null, surname: null, role: null },
    ui: { status: 'LOADING', mode: null, errorMessage: null },
  });

  await appInit({ store: guestStore, api: {} });
  let state = guestStore.getState();
  assert(state.ui.status === 'READY', 'appInit (guest): status je READY');
  assert(state.ui.mode === 'AUTH_VIEW', 'appInit (guest): mode je AUTH_VIEW');

  // --- appInit: přihlášený uživatel → načte data paralelně ---
  const mockApi = {
    reservations: { getAll: async () => [{ reservation_id: 1 }] },
    payments: {
      getHistory: async () => [{ payment_id: 1 }],
      getBalance: async () => ({ credit_balance: 500 }),
    },
    lessons: {
      getAll: async () => [{ lesson_id: 1 }],
      getTrainers: async () => [{ employee_id: 1 }],
      getLessonTypes: async () => [{ lesson_type_id: 1 }],
    },
  };

  const memberStore = createMockStore({
    auth: { memberId: 42, name: 'Petr', surname: 'Test', role: 'member' },
    ui: { status: 'LOADING', mode: null, errorMessage: null },
  });

  await appInit({ store: memberStore, api: mockApi });
  state = memberStore.getState();
  assert(state.ui.status === 'READY', 'appInit (member): status je READY po načtení');
  assert(state.ui.mode === 'RESERVATION_LIST', 'appInit (member): mode je RESERVATION_LIST');
  assert(state.reservations.length === 1, 'appInit (member): reservations načteny');
  assert(state.creditBalance === 500, 'appInit (member): creditBalance načten');
  assert(state.lessons.length === 1, 'appInit (member): lessons načteny');

  // --- appInit: selhání API → ERROR stav ---
  const failApi = {
    reservations: { getAll: async () => { throw new Error('Server nedostupný'); } },
    payments: {
      getHistory: async () => [],
      getBalance: async () => ({ credit_balance: 0 }),
    },
    lessons: {
      getAll: async () => [],
      getTrainers: async () => [],
      getLessonTypes: async () => [],
    },
  };

  const failStore = createMockStore({
    auth: { memberId: 1, name: 'Test', surname: 'Test', role: 'member' },
    ui: { status: 'LOADING', mode: null, errorMessage: null },
  });

  await appInit({ store: failStore, api: failApi });
  state = failStore.getState();
  assert(state.ui.status === 'ERROR', 'appInit (chyba): status je ERROR');
  assert(state.ui.errorMessage !== null, 'appInit (chyba): errorMessage je vyplněn');

  // --- appInit: 401 odpověď → automatické odhlášení ---
  // Potřebujeme mock localStorage pro Node.js
  const origLS = globalThis.localStorage;
  globalThis.localStorage = createMockLocalStorage();
  globalThis.localStorage.setItem('token', 'expired-token');

  const error401 = new Error('Unauthorized');
  error401.status = 401;
  const authFailApi = {
    reservations: { getAll: async () => { throw error401; } },
    payments: {
      getHistory: async () => [],
      getBalance: async () => ({ credit_balance: 0 }),
    },
    lessons: {
      getAll: async () => [],
      getTrainers: async () => [],
      getLessonTypes: async () => [],
    },
  };

  const authFailStore = createMockStore({
    auth: { memberId: 1, name: 'Test', surname: 'Test', role: 'member' },
    ui: { status: 'LOADING', mode: null, errorMessage: null },
  });

  await appInit({ store: authFailStore, api: authFailApi });
  state = authFailStore.getState();
  assert(state.auth.memberId === null, 'appInit (401): memberId vynulován');
  assert(state.ui.mode === 'AUTH_VIEW', 'appInit (401): přesměrován na AUTH_VIEW');
  assert(globalThis.localStorage.getItem('token') === null, 'appInit (401): token odstraněn z localStorage');

  // Restore localStorage
  if (origLS) globalThis.localStorage = origLS;

  // --- enrollLesson: úspěch → aktualizace stavu + notifikace ---
  const enrollStore = createMockStore({
    auth: { memberId: 5 },
    lessons: [],
    reservations: [],
    creditBalance: 500,
    ui: { status: 'READY', notification: null },
  });

  const enrollApi = {
    reservations: {
      create: async () => ({ reservation_id: 99, credit_balance: 200 }),
      getAll: async () => [{ reservation_id: 99 }],
    },
    lessons: { getAll: async () => [{ lesson_id: 1, status: 'OPEN' }] },
  };

  await enrollLesson({
    store: enrollStore,
    api: enrollApi,
    payload: { lessonId: 1 },
  });

  state = enrollStore.getState();
  assert(state.ui.status === 'READY', 'enrollLesson: status je READY po úspěchu');
  assert(state.ui.notification?.type === 'SUCCESS', 'enrollLesson: notifikace úspěchu');
  assert(state.creditBalance === 200, 'enrollLesson: creditBalance aktualizován z odpovědi');
  assert(state.reservations.length === 1, 'enrollLesson: reservations aktualizovány');

  // --- enrollLesson: chyba API → varovná notifikace ---
  const enrollFailStore = createMockStore({
    auth: { memberId: 5 },
    ui: { status: 'READY', notification: null },
  });

  const enrollFailApi = {
    reservations: {
      create: async () => { throw new Error('Nedostatek kreditů'); },
    },
  };

  await enrollLesson({
    store: enrollFailStore,
    api: enrollFailApi,
    payload: { lessonId: 1 },
  });

  state = enrollFailStore.getState();
  assert(state.ui.status === 'READY', 'enrollLesson (chyba): status je READY (ne ERROR)');
  assert(state.ui.notification?.type === 'WARNING', 'enrollLesson (chyba): notifikace varování');

  console.log('[IR03] Všechny testy asynchronní vrstvy prošly ✓');
}
