// Akce pro vstup do admin pohledu.
//
// Načte všechny PENDING platby z backendu a přepne UI do ADMIN_VIEW.

import * as CONST from '../../constants.js';
import * as STATUS from '../../statuses.js';

export async function enterAdminView({ store, api }) {
  store.setState((state) => ({
    ...state,
    ui: { ...state.ui, status: STATUS.LOAD },
  }));

  try {
    const pendingPayments = await api.admin.getPendingPayments();

    if (typeof history !== 'undefined') history.pushState({}, '', '/admin');

    store.setState((state) => ({
      ...state,
      pendingPayments,
      ui: { ...state.ui, status: STATUS.RDY, mode: CONST.ADMIN_VIEW },
    }));
  } catch (error) {
    store.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        status: STATUS.ERR,
        errorMessage: error.message ?? 'Nepodařilo se načíst čekající platby.',
      },
    }));
  }
}
