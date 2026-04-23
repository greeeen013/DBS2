import * as STATUS from '../../statuses.js';

export async function createTariff({ store, api, payload }) {
  const { name, description, price, duration_months, duration_days } = payload;

  try {
    await api.memberships.createTariff({ name, description, price, duration_months, duration_days });

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
