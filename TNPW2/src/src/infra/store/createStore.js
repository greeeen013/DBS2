// Implementace store – přejato beze změn ze vzorového projektu prepare/.
//
// Store je jeden zdroj pravdy pro celou aplikaci (Flux princip).
// State je uzavřen v closure – nelze ho měnit přímo, jen přes setState().
// Tím zajistím předvídatelné změny stavu a snadné debugování.

export function createStore(initialState) {
  let state = initialState;
  const listeners = [];

  function getState() {
    return state;
  }

  function setState(updateFunction) {
    state = updateFunction(state);
    listeners.forEach((l) => l(state));
  }

  function subscribe(listener) {
    listeners.push(listener);
  }

  return {
    getState,
    setState,
    subscribe,
  };
}
