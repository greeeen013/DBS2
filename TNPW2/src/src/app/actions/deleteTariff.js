import * as STATUS from '../../statuses.js';

export async function deleteTariff({ store, api, payload }) {
  const { tariffId } = payload;

  try {
    await api.memberships.deleteTariff(tariffId);

    store.setState((state) => ({
      ...state,
      tariffs: state.tariffs.filter((t) => t.tariff_id !== tariffId),
      ui: {
        ...state.ui,
        notification: { type: STATUS.OK, message: 'Tarif byl smazán.' },
      },
    }));
  } catch (error) {
    store.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        notification: { type: STATUS.ERR, message: error.message ?? 'Smazání tarifu selhalo.' },
      },
    }));
  }
}
