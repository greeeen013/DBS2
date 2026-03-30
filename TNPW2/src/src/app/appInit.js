// Asynchronní inicializace aplikace – načtení dat z backendu při startu.
//
// Vzor totožný se prepare/appInit.js – nejdříve nastavíme stav LOADING,
// pak asynchronně načteme data, pak přejdeme do READY (nebo ERROR při selhání).
//
// Načítáme paralelně rezervace i kreditový zůstatek pomocí Promise.all,
// aby se minimalizovala celková doba čekání.

import * as STATUS from '../statuses.js';
import * as CONST from '../constants.js';

export async function appInit({ store, api }) {
  const memberId = store.getState().auth.memberId;

  // Signalizace načítání – frontend zobrazí LoadingView
  store.setState((state) => ({
    ...state,
    ui: { ...state.ui, status: STATUS.LOAD, errorMessage: null },
  }));

  try {
    // Paralelní načtení rezervací, plateb a kreditového zůstatku
    const [rezervace, platby, zustatek] = await Promise.all([
      api.reservations.getAll(memberId),
      api.payments.getHistory(memberId),
      api.payments.getBalance(memberId),
    ]);

    store.setState((state) => ({
      ...state,
      reservations: rezervace,
      payments: platby,
      creditBalance: zustatek.credit_balance,
      ui: {
        ...state.ui,
        status: STATUS.RDY,
        mode: CONST.RESERVATION_LIST,
        errorMessage: null,
      },
    }));
  } catch (error) {
    // Při selhání backendu ukážeme chybový pohled s popisem problému
    store.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        status: STATUS.ERR,
        errorMessage: error.message ?? 'Nepodařilo se načíst data ze serveru.',
      },
    }));
  }
}
