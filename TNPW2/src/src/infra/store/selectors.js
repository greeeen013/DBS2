// Selektory pro MMA aplikaci.
//
// Selektory vypočítávají odvozené hodnoty ze stavu a capabilities pro UI.
// Vzor přejat z prepare/selectors.js – odděluje logiku "co zobrazit" od stavu.

import * as CONST from '../../constants.js';
import * as STATUS from '../../statuses.js';

// --- Datové selektory ---

export function selectReservations(state) {
  return state.reservations ?? [];
}

export function selectPayments(state) {
  return state.payments ?? [];
}

export function selectCreditBalance(state) {
  return state.creditBalance;
}

// --- Capability selektory ---

export function canConfirmReservation(rezervace) {
  return rezervace.status === 'CREATED';
}

export function canCancelReservation(rezervace) {
  return rezervace.status === 'CREATED' || rezervace.status === 'CONFIRMED';
}

export function hasCredits(state) {
  return (state.creditBalance ?? 0) > 0;
}

export function selectIsAdmin(state) {
  return state.auth.role === 'admin';
}

// --- View selektory ---

export function selectReservationListView(state) {
  const rezervace = selectReservations(state);
  const zustatek = selectCreditBalance(state);

  return {
    type: CONST.RESERVATION_LIST,
    rezervace,
    zustatek,
    capabilities: {
      canGoToPayments: true,
      canConfirm: true,   // Podmínka závisí na konkrétní rezervaci, ne na celém stavu
      canCancel: true,
    },
  };
}

export function selectPaymentView(state) {
  const platby = selectPayments(state);
  const zustatek = selectCreditBalance(state);

  return {
    type: CONST.PAYMENT_VIEW,
    platby,
    zustatek,
    capabilities: {
      canGoToReservations: true,
      canPay: true,
    },
  };
}

export function selectProfileView(state) {
  return {
    type: CONST.PROFILE_VIEW,
    historyReservations: state.history?.reservations ?? [],
    historyPayments: state.history?.payments ?? [],
    capabilities: {
      canGoToReservations: true,
      canGoToPayments: true,
    },
  };
}

export function selectAuthView(state) {
  return {
    type: CONST.AUTH_VIEW,
  };
}

export function selectAdminView(state) {
  return {
    type: CONST.ADMIN_VIEW,
    pendingPayments: state.pendingPayments ?? [],
  };
}

/**
 * Hlavní selektor – vrací viewState na základě aktuálního UI módu.
 * Vzor totožný s prepare/selectors.js selectViewState().
 */
export function selectViewState(state) {
  // LOADING stav – zobrazí se spinner
  if (state.ui.status === STATUS.LOAD) {
    return { type: 'LOADING' };
  }

  // ERROR stav – zobrazí se chybová zpráva
  if (state.ui.status === STATUS.ERR) {
    return { type: 'ERROR', message: state.ui.errorMessage ?? 'Nastala chyba.' };
  }

  switch (state.ui.mode) {
    case CONST.RESERVATION_LIST:
      return selectReservationListView(state);
    case CONST.PAYMENT_VIEW:
      return selectPaymentView(state);
    case CONST.PROFILE_VIEW:
      return selectProfileView(state);
    case CONST.AUTH_VIEW:
      return selectAuthView(state);
    case CONST.ADMIN_VIEW:
      return selectAdminView(state);
    default:
      return { type: 'ERROR', message: 'Neznámý pohled aplikace.' };
  }
}
