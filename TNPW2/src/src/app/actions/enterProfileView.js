import * as CONST from '../../constants.js';
import * as STATUS from '../../statuses.js';

export async function enterProfileView({ store, api }) {
  if (typeof history !== 'undefined') {
    history.pushState({}, '', '/profile');
  }

  store.setState((state) => ({
    ...state,
    ui: { ...state.ui, mode: CONST.PROFILE_VIEW, status: STATUS.LOAD, notification: null },
  }));

  try {
    const historieCombined = await api.profile.getHistory();

    store.setState((state) => ({
      ...state,
      history: {
        reservations: historieCombined.reservations,
        payments: historieCombined.payments,
      },
      ui: { ...state.ui, status: STATUS.RDY },
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
    return;
  }

  // Profil (fotka) se načítá samostatně – jeho selhání nesmí blokovat historii
  try {
    const memberProfile = await api.profile.getProfile();
    store.setState((state) => ({ ...state, memberProfile }));
  } catch (_) {
    // foto endpoint nemusí být dostupný, ignorujeme
  }
}
