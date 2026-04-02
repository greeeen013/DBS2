// src/app/store.js
//
// Singleton instance centrálního store – IR01.
//
// Modul se v JS načte jen jednou (ES module caching), takže i 'store'
// je jen jednou v paměti – to je záměr, chceme jeden zdroj pravdy.
//
// Použití:
//   import { store } from '../app/store.js';
//   store.getState();          // přečíst stav
//   store.setState(s => ...);  // změnit stav
//   store.subscribe(render);   // přihlásit se k odběru změn

import { createStore } from '../infra/store/createStore.js';
import { createInitialState } from './state.js';

// Vytvoříme jedinou instanci store pro celou aplikaci.
// createInitialState() zajistí čistý výchozí stav (GUEST + prázdné rezervace).
export const store = createStore(createInitialState());
