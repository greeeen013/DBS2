// Inicializace aplikace – přejato a upraveno ze vzoru prepare/app/init.js.
//
// Propojuji store, API a render – klasická Flux architektura:
//   akce → dispatch → setState → render

import { createInitialState } from './state.js';
import { createStore } from '../infra/store/createStore.js';
import { createDispatcher } from './dispatch.js';
import { render } from '../ui/render.js';
import { createReservationsApi } from '../api/reservationsApi.js';
import { createPaymentsApi } from '../api/paymentsApi.js';

// Vytvoření API objektu – používá reálný fetch(), ne mock
const api = {
  reservations: createReservationsApi(),
  payments: createPaymentsApi(),
};

const store = createStore(createInitialState());
const dispatch = createDispatcher(store, api);

// Napojení renderu na změny stavu
const root = document.getElementById('app');
store.subscribe((state) => render(root, state, dispatch));

// Spuštění inicializace – načte data z backendu
dispatch({ type: 'APP_INIT' });
