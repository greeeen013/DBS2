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
    const isAdmin = store.getState().auth?.role === 'admin';
    const requests = [
      api.memberships.fetchTariffs(),
      api.memberships.fetchMyMemberships(),
      isAdmin ? api.memberships.fetchArchivedTariffs() : Promise.resolve([]),
    ];
    const [tariffs, memberships, archivedTariffs] = await Promise.all(requests);

    store.setState((state) => ({
      ...state,
      tariffs,
      memberships,
      archivedTariffs,
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
