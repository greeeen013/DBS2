import * as STATUS from '../../statuses.js';

export async function rejectPayment({ store, api, payload }) {
  const { paymentId } = payload;

  try {
    await api.admin.rejectPayment(paymentId);
    const updated = await api.admin.getPendingPayments();
    store.setState((state) => ({
      ...state,
      pendingPayments: updated,
      ui: {
        ...state.ui,
        notification: { type: STATUS.OK, message: 'Platba byla zamítnuta.' },
      },
    }));
  } catch (error) {
    store.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        notification: { type: STATUS.ERR, message: error.message ?? 'Zamítnutí platby selhalo.' },
      },
    }));
  }
}
