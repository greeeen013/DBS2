// Unit testy pro createStore() – IR01.
//
// Ověřují, že centrální Store správně:
// - uchovává a vrací stav (getState)
// - mění stav přes updateFunction (setState)
// - informuje odběratele o každé změně (subscribe)
// - vrací funkci pro odhlášení odběru (unsubscribe)
//
// Testy záměrně nepoužívají DOM ani síťová volání.

import { createStore } from '../../src/infra/store/createStore.js';
import { assert } from '../support/assert.mjs';

export function testCreateStore() {
  console.log('\n[IR01] Testy createStore:');

  // --- getState ---
  // Store musí při inicializaci vrátit přesně ten stav, který jsme předali.
  const initial = { user: { role: 'GUEST' }, activeReservations: [], ui: { status: 'LOADING' } };
  const store = createStore(initial);

  assert(store.getState() === initial, 'getState vrátí výchozí stav po inicializaci');

  // --- setState ---
  // Po zavolání setState musí getState vrátit aktualizovaný stav.
  store.setState((s) => ({ ...s, ui: { status: 'READY' } }));
  assert(store.getState().ui.status === 'READY', 'setState aktualizuje stav');

  // Původní stav nesmí být mutován – immutabilní přístup.
  assert(initial.ui.status === 'LOADING', 'setState nemutuje původní objekt stavu');

  // --- subscribe ---
  // Listener musí být zavolán při každé změně stavu.
  let callCount = 0;
  let lastState = null;
  store.subscribe((s) => {
    callCount++;
    lastState = s;
  });

  store.setState((s) => ({ ...s, ui: { status: 'ERROR' } }));
  assert(callCount === 1, 'listener je zavolán po setState');
  assert(lastState.ui.status === 'ERROR', 'listener dostane nový stav jako argument');

  // Listener smí být zavolán i podruhé.
  store.setState((s) => ({ ...s, ui: { status: 'READY' } }));
  assert(callCount === 2, 'listener je zavolán při každé změně stavu');

  // --- unsubscribe ---
  // Po odhlášení nesmí být listener volán.
  const store2 = createStore({ count: 0 });
  let fired = false;
  const unsubscribe = store2.subscribe(() => { fired = true; });

  unsubscribe(); // Odhlásíme se
  store2.setState((s) => ({ count: s.count + 1 }));
  assert(fired === false, 'listener není zavolán po unsubscribe');
}
