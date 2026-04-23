import * as STATUS from '../../statuses.js';

export async function restoreTariff({ store, api, payload }) {
  const { tariffId } = payload;

  try {
    await api.memberships.restoreTariff(tariffId);

    const [tariffs, archivedTariffs] = await Promise.all([
      api.memberships.fetchTariffs(),
      api.memberships.fetchArchivedTariffs(),
    ]);

    store.setState((state) => ({
      ...state,
      tariffs,
      archivedTariffs,
      ui: {
        ...state.ui,
        notification: { type: STATUS.OK, message: 'Tarif byl obnoven.' },
      },
    }));
  } catch (error) {
    store.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        notification: { type: STATUS.ERR, message: error.message ?? 'Obnovení tarifu selhalo.' },
      },
    }));
  }
}
