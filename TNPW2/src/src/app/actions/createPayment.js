// Akce: vytvoření platby a její okamžité dokončení (přičtení kreditů).
//
// V reálném systému by platba čekala na potvrzení z banky.
// Pro demonstraci IR03 rovnou přejdeme PENDING → COMPLETED.

import * as STATUS from '../../statuses.js';

export async function createPayment({ store, api, payload }) {
  const { amount } = payload;
  const memberId = store.getState().auth.memberId;

  store.setState((state) => ({
    ...state,
    ui: { ...state.ui, status: STATUS.LOAD, notification: null },
  }));

  try {
    // Vytvoření platby (PENDING)
    const platba = await api.payments.create({
      amount,
      payment_type: 'CARD',
      member_id: memberId,
    });

    // Okamžité dokončení – přičte kredity
    await api.payments.updateStatus(platba.payment_id, 'COMPLETED');

    // Aktualizace kreditového zůstatku po úspěšné platbě
    const zustatek = await api.payments.getBalance(memberId);
    const historiePlateb = await api.payments.getHistory(memberId);

    store.setState((state) => ({
      ...state,
      payments: historiePlateb,
      creditBalance: zustatek.credit_balance,
      ui: {
        ...state.ui,
        status: STATUS.RDY,
        notification: {
          type: STATUS.OK,
          message: `Platba ${amount} Kč proběhla úspěšně. Kredity byly připsány.`,
        },
      },
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
