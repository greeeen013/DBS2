// src/infra/store/createStore.js
//
// Centrální mechanismus pro správu stavu – základ infrastrukturní role IR01.
//
// Princip fungování:
// - Stav je uzavřený v closure (privátní proměnná `state`).
// - Ven vystavujeme pouze tři metody: getState, setState, subscribe.
// - Nikdo mimo store nemá přímý přístup k internímu state.
//
// Klíčové koncepty (pro obhajobu):
// - Closure: 'state' je přístupný pouze funkcím uvnitř createStore, z venku ho nelze číst ani psát přímo.
// - Inversion of Control: logiku změny předáváme jako funkci (updateFunction) zvenčí.
// - Single source of truth: celý stav aplikace žije na jednom místě.

/**
 * Vytvoří nový store (datové úložiště) s daným počátečním stavem.
 *
 * @param {Object} initialState - Výchozí stav aplikace (výsledek createInitialState).
 * @returns {{ getState: Function, setState: Function, subscribe: Function }}
 */
export function createStore(initialState) {
  // Stav je privátní – žádná komponenta ho nemůže změnit přímo.
  let state = initialState;

  // Pole odběratelů (listeners), kteří chtějí být informováni o každé změně stavu.
  const listeners = [];

  /**
   * Vrátí aktuální stav (read-only pohled – objekty nejsou deep-frozen,
   * ale dohoda je, že NIKDO stav nemodifikuje přímo, vždy jen přes setState).
   *
   * @returns {Object} Aktuální stav aplikace.
   */
  function getState() {
    return state;
  }

  /**
   * Změní stav pomocí update funkce (reducer pattern).
   *
   * KONVENCE (není vynucena kódem): updateFunction musí vracet NOVÝ objekt,
   * nikoliv mutovat a vracet původní referenci. Porušení konvence způsobí, že
   * listeners nedostane nový stav a UI se nepřerenderuje správně.
   * Správně: setState(s => ({ ...s, user: { ...s.user, role: 'MEMBER' } }))
   * Špatně:  setState(s => { s.user.role = 'MEMBER'; return s; })
   *
   * @param {Function} updateFunction - Funkce s podpisem (currentState) => newState.
   */
  function setState(updateFunction) {
    // Immutabilní přístup: vždy vytvoříme nový objekt, původní stav nepřepíšeme.
    state = updateFunction(state);

    // Upozorníme všechny odběratele (např. render funkce) o změně stavu.
    listeners.forEach((listener) => listener(state));
  }

  /**
   * Přihlásí funkci k odběru změn stavu.
   * Listener se zavolá pokaždé, když setState změní stav.
   *
   * @param {Function} listener - Callback volaný s novým stavem jako argumentem.
   */
  function subscribe(listener) {
    listeners.push(listener);
  }

  // Veřejné API store – vše ostatní je skryto v closure.
  return {
    getState,
    setState,
    subscribe,
  };
}
