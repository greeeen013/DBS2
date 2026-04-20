import * as STATUS from '../../statuses.js';

export async function createTariff({ store, api, payload }) {
  const { name, description, price } = payload;

  try {
    await api.memberships.createTariff({ name, description, price });

    const tariffs = await api.memberships.fetchTariffs();

    store.setState((state) => ({
      ...state,
      tariffs,
      ui: {
        ...state.ui,
        notification: { type: STATUS.OK, message: `Tarif "${name}" byl úspěšně přidán.` },
      },
    }));
  } catch (error) {
    store.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        notification: { type: STATUS.ERR, message: error.message ?? 'Vytvoření tarifu selhalo.' },
      },
    }));
  }
}
