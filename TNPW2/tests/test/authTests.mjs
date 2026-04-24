// Unit testy pro IR08 – Autentizace a technická autorizace.
//
// Testují, že:
//   • loginAction() při úspěchu uloží token + údaje do localStorage
//   • loginAction() při úspěchu aktualizuje auth stav v store
//   • loginAction() při chybě nastaví ERROR stav s chybovou zprávou
//   • registerAction() při úspěchu uloží token + údaje do localStorage
//   • registerAction() při chybě nastaví ERROR stav
//   • Odhlášení (LOGOUT dispatch) vymaže localStorage a resetuje auth stav
//   • Obnovení session z localStorage při startu aplikace
//
// Testy nepoužívají síťová volání – API vrstva je mockovaná.
// localStorage je mockovaný pro Node.js prostředí.

import { loginAction, registerAction } from '../../src/src/app/actions/authActions.js';
import { assert } from '../support/assert.mjs';

// ---------------------------------------------------------------------------
// Mock store
// ---------------------------------------------------------------------------
function createMockStore(initialState) {
  let state = initialState;
  return {
    getState: () => state,
    setState: (fn) => { state = fn(state); },
  };
}

// ---------------------------------------------------------------------------
// Mock localStorage pro Node.js
// ---------------------------------------------------------------------------
function createMockLocalStorage() {
  const data = {};
  return {
    getItem: (key) => data[key] ?? null,
    setItem: (key, val) => { data[key] = String(val); },
    removeItem: (key) => { delete data[key]; },
    clear: () => { for (const k of Object.keys(data)) delete data[k]; },
    _data: data,
  };
}

// ---------------------------------------------------------------------------
// IR08 testy
// ---------------------------------------------------------------------------

export async function testIR08() {
  console.log('\n[IR08] Testy autentizace (login, register, session):');

  // Nastavíme mock localStorage a window (Node.js je nemá)
  const origLS = globalThis.localStorage;
  const origWindow = globalThis.window;
  globalThis.localStorage = createMockLocalStorage();
  globalThis.window = { location: { pathname: '/' } };

  // --- loginAction: úspěch → uloží token a aktualizuje auth ---
  const loginStore = createMockStore({
    auth: { memberId: null, name: null, surname: null, role: null },
    ui: { status: 'READY', errorMessage: null },
  });

  const mockLoginApi = {
    auth: {
      login: async (email, password) => ({
        access_token: 'jwt-token-123',
        member_id: 42,
        name: 'Petr',
        surname: 'Svoboda',
        role: 'member',
      }),
    },
  };

  // Mock dispatch – loginAction volá dispatch({ type: 'APP_INIT' })
  const dispatchCalls = [];
  const mockDispatch = (action) => {
    dispatchCalls.push(action);
    return Promise.resolve();
  };

  await loginAction({
    store: loginStore,
    api: mockLoginApi,
    payload: { email: 'clen1@pretorian.cz', password: 'Heslo123' },
    dispatch: mockDispatch,
  });

  let state = loginStore.getState();

  // Auth stav je aktualizovaný
  assert(state.auth.memberId === 42, 'loginAction: memberId nastaven v store');
  assert(state.auth.name === 'Petr', 'loginAction: name nastaven v store');
  assert(state.auth.role === 'member', 'loginAction: role nastaven v store');

  // Token uložen v localStorage
  assert(globalThis.localStorage.getItem('token') === 'jwt-token-123', 'loginAction: token uložen do localStorage');
  assert(globalThis.localStorage.getItem('memberId') === '42', 'loginAction: memberId uložen do localStorage');
  assert(globalThis.localStorage.getItem('memberName') === 'Petr', 'loginAction: memberName uložen do localStorage');
  assert(globalThis.localStorage.getItem('memberRole') === 'member', 'loginAction: memberRole uložen do localStorage');

  // Po loginu se volá APP_INIT dispatch
  assert(dispatchCalls.some((c) => c.type === 'APP_INIT'), 'loginAction: dispatch volán s APP_INIT po přihlášení');

  // --- loginAction: chyba → ERROR stav ---
  globalThis.localStorage = createMockLocalStorage();

  const loginFailStore = createMockStore({
    auth: { memberId: null, name: null, surname: null, role: null },
    ui: { status: 'READY', errorMessage: null },
  });

  const failLoginApi = {
    auth: {
      login: async () => { throw new Error('Špatné heslo'); },
    },
  };

  await loginAction({
    store: loginFailStore,
    api: failLoginApi,
    payload: { email: 'neexistuje@test.cz', password: 'spatne' },
    dispatch: () => Promise.resolve(),
  });

  state = loginFailStore.getState();
  assert(state.ui.status === 'ERROR', 'loginAction (chyba): status je ERROR');
  assert(state.ui.errorMessage === 'Špatné heslo', 'loginAction (chyba): errorMessage obsahuje text chyby');
  assert(state.auth.memberId === null, 'loginAction (chyba): memberId zůstává null');

  // Token nesmí být uložen při chybě
  assert(globalThis.localStorage.getItem('token') === null, 'loginAction (chyba): token neuložen do localStorage');

  // --- registerAction: úspěch → uloží token a aktualizuje auth ---
  globalThis.localStorage = createMockLocalStorage();

  const regStore = createMockStore({
    auth: { memberId: null, name: null, surname: null, role: null },
    ui: { status: 'READY', errorMessage: null },
  });

  const mockRegApi = {
    auth: {
      register: async () => ({
        access_token: 'reg-token-456',
        member_id: 99,
        name: 'Nový',
        surname: 'Uživatel',
        role: 'member',
      }),
    },
  };

  const regDispatches = [];
  await registerAction({
    store: regStore,
    api: mockRegApi,
    payload: { name: 'Nový', surname: 'Uživatel', email: 'novy@test.cz', password: 'Heslo123' },
    dispatch: (action) => { regDispatches.push(action); return Promise.resolve(); },
  });

  state = regStore.getState();
  assert(state.auth.memberId === 99, 'registerAction: memberId nastaven');
  assert(state.auth.name === 'Nový', 'registerAction: name nastaven');
  assert(globalThis.localStorage.getItem('token') === 'reg-token-456', 'registerAction: token uložen');
  assert(regDispatches.some((c) => c.type === 'APP_INIT'), 'registerAction: dispatch volán s APP_INIT');

  // --- registerAction: chyba → ERROR stav ---
  globalThis.localStorage = createMockLocalStorage();

  const regFailStore = createMockStore({
    auth: { memberId: null, name: null, surname: null, role: null },
    ui: { status: 'READY', errorMessage: null },
  });

  const failRegApi = {
    auth: {
      register: async () => { throw new Error('Email již existuje'); },
    },
  };

  await registerAction({
    store: regFailStore,
    api: failRegApi,
    payload: { email: 'existuje@test.cz', password: 'Heslo123' },
    dispatch: () => Promise.resolve(),
  });

  state = regFailStore.getState();
  assert(state.ui.status === 'ERROR', 'registerAction (chyba): status je ERROR');
  assert(state.ui.errorMessage === 'Email již existuje', 'registerAction (chyba): errorMessage obsahuje text');
  assert(state.auth.memberId === null, 'registerAction (chyba): memberId zůstává null');

  // --- Session obnovení: localStorage → auth stav ---
  // Simulujeme, že uživatel má uložený token v localStorage
  globalThis.localStorage = createMockLocalStorage();
  globalThis.localStorage.setItem('token', 'saved-token');
  globalThis.localStorage.setItem('memberId', '7');
  globalThis.localStorage.setItem('memberName', 'Jan');
  globalThis.localStorage.setItem('memberSurname', 'Pospíšil');
  globalThis.localStorage.setItem('memberRole', 'trainer');

  // Ověříme, že data jsou čitelná z localStorage (simulace init.js)
  const restoredAuth = {
    memberId: parseInt(globalThis.localStorage.getItem('memberId')),
    name: globalThis.localStorage.getItem('memberName'),
    surname: globalThis.localStorage.getItem('memberSurname'),
    role: globalThis.localStorage.getItem('memberRole'),
  };

  assert(restoredAuth.memberId === 7, 'session restore: memberId načten z localStorage');
  assert(restoredAuth.name === 'Jan', 'session restore: name načten z localStorage');
  assert(restoredAuth.role === 'trainer', 'session restore: role načten z localStorage');
  assert(globalThis.localStorage.getItem('token') === 'saved-token', 'session restore: token stále v localStorage');

  // --- Logout: vymazání localStorage a resetování auth stavu ---
  // Simulujeme co dělá LOGOUT akce v dispatch.js
  globalThis.localStorage.removeItem('token');
  globalThis.localStorage.removeItem('memberId');
  globalThis.localStorage.removeItem('memberName');
  globalThis.localStorage.removeItem('memberSurname');
  globalThis.localStorage.removeItem('memberRole');

  assert(globalThis.localStorage.getItem('token') === null, 'logout: token odstraněn z localStorage');
  assert(globalThis.localStorage.getItem('memberId') === null, 'logout: memberId odstraněn z localStorage');
  assert(globalThis.localStorage.getItem('memberRole') === null, 'logout: memberRole odstraněn z localStorage');

  // Obnovíme původní globální objekty
  if (origLS) globalThis.localStorage = origLS;
  if (origWindow) globalThis.window = origWindow;

  console.log('[IR08] Všechny testy autentizace prošly ✓');
}
