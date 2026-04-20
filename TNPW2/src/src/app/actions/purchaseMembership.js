import * as STATUS from '../../statuses.js';

export async function purchaseMembership({ store, api, payload }) {
  const { tariffId } = payload;

  try {
    await api.memberships.purchaseMembership(tariffId);

    // Obnovíme memberships a creditBalance po nákupu
    const [memberships, balanceData] = await Promise.all([
      api.memberships.fetchMyMemberships(),
      api.payments.getBalance(store.getState().auth.memberId),
    ]);

    store.setState((state) => ({
      ...state,
      memberships,
      creditBalance: balanceData.credit_balance,
      ui: {
        ...state.ui,
        notification: { type: STATUS.OK, message: 'Permanentka byla úspěšně zakoupena.' },
      },
    }));
  } catch (error) {
    store.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        notification: { type: STATUS.ERR, message: error.message ?? 'Zakoupení permanentky selhalo.' },
      },
    }));
  }
}
