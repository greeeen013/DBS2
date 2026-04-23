import * as CONST from '../../constants.js';
import * as STATUS from '../../statuses.js';

export async function enterAdminView({ store, api }) {
  store.setState((state) => ({
    ...state,
    ui: { ...state.ui, status: STATUS.LOAD },
  }));

  try {
    const [pendingPayments, membersNoMembership, trainerStats] = await Promise.all([
      api.admin.getPendingPayments(),
      api.stats.getMembersNoMembership(),
      api.stats.getTrainerStats(),
    ]);

    if (typeof history !== 'undefined') history.pushState({}, '', '/admin');

    store.setState((state) => ({
      ...state,
      pendingPayments,
      membersNoMembership,
      trainerStats,
      ui: { ...state.ui, status: STATUS.RDY, mode: CONST.ADMIN_VIEW },
    }));
  } catch (error) {
    store.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        status: STATUS.ERR,
        errorMessage: error.message ?? 'Nepodařilo se načíst admin data.',
      },
    }));
  }
}
