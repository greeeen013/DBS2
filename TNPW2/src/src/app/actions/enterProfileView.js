// Akce: přechod do profilového pohledu a načtení kombinované historie (IR04).
//
// Vzor identický s confirmReservation.js:
//   1. Přechod do loading stavu
//   2. Asynchronní volání API
//   3. Aktualizace stavu s daty nebo chybovou notifikací

import * as CONST from '../../constants.js';
import * as STATUS from '../../statuses.js';

export async function enterProfileView({ store, api }) {
  // Synchronizace URL s aktuálním pohledem
  if (typeof history !== 'undefined') {
    history.pushState({}, '', '/profile');
  }

  store.setState((state) => ({
    ...state,
    ui: {
      ...state.ui,
      mode: CONST.PROFILE_VIEW,
      status: STATUS.LOAD,
      notification: null,
    },
  }));

  try {
    const historieCombined = await api.profile.getHistory();

    store.setState((state) => ({
      ...state,
      history: {
        reservations: historieCombined.reservations,
        payments: historieCombined.payments,
      },
      ui: {
        ...state.ui,
        status: STATUS.RDY,
      },
    }));
  } catch (error) {
    store.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        status: STATUS.RDY,
        notification: { type: STATUS.WAR, message: error.message },
      },
    }));
  }
}
