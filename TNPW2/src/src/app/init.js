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
import { createProfileApi } from '../api/profileApi.js';
import { createAuthApi } from '../api/authApi.js';
import { createAdminApi } from '../api/adminApi.js';
import { createLessonsApi } from '../api/lessonsApi.js';
import { createMembershipsApi } from '../api/membershipsApi.js';
import { initRouter, pathnameToAction } from './router.js';
import * as CONST from '../constants.js';

// Vytvoření API objektu – používá reálný fetch(), ne mock
const api = {
  reservations: createReservationsApi(),
  payments: createPaymentsApi(),
  profile: createProfileApi(),
  auth: createAuthApi(),
  admin: createAdminApi(),
  lessons: createLessonsApi(),
  memberships: createMembershipsApi(),
};

const store = createStore(createInitialState());
const dispatch = createDispatcher(store, api);

// Napojení renderu na změny stavu
const root = document.getElementById('app');
store.subscribe((state) => render(root, state, dispatch));

// Registrace popstate listeneru pro browser back/forward (IR04)
initRouter(dispatch);

// Spuštění inicializace – načte data z backendu.
// Po dokončení APP_INIT navigujeme na pohled odpovídající aktuální URL.
dispatch({ type: 'APP_INIT' }).then(() => {
  const action = pathnameToAction(window.location.pathname);
  if (action !== CONST.ENTER_RESERVATION_LIST) {
    dispatch({ type: action });
  }
});
