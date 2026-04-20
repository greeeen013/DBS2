import * as CONST from '../../constants.js';
import * as STATUS from '../../statuses.js';

export async function enterPermitsView({ store, api }) {
  if (typeof history !== 'undefined') {
    history.pushState({}, '', '/permits');
  }

  store.setState((state) => ({
    ...state,
    ui: { ...state.ui, mode: CONST.PERMITS_VIEW, status: STATUS.LOAD, notification: null },
  }));

  try {
    const [tariffs, memberships] = await Promise.all([
      api.memberships.fetchTariffs(),
      api.memberships.fetchMyMemberships(),
    ]);

    store.setState((state) => ({
      ...state,
      tariffs,
      memberships,
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
  }
}
