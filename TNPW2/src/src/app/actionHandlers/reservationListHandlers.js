// IR07 – Handler factory pro pohled ReservationListView.
//
// Vrací handlery pro pohled se seznamem rezervací.
// Odděluje "co je povoleno" (z IR05 capabilities) od "jak to volat" (dispatch).

import * as CONST from '../../constants.js';

/**
 * Vytvoří handlery pro pohled se seznamem rezervací.
 *
 * @param {Function} dispatch     - Dispatchovací funkce
 * @param {Object}   viewState    - View-state s capabilities a reservationCapabilities
 * @returns {Object}              - Handlery vázané na dispatch
 */
export function reservationListHandlers(dispatch, viewState) {
  const { capabilities = {}, reservationCapabilities = [] } = viewState;

  const handlers = {};

  // Navigace na platby
  if (capabilities.canGoToPayments) {
    handlers.onGoToPayments = () =>
      dispatch({ type: CONST.ENTER_PAYMENT_VIEW });
  }

  // Navigace na profil
  handlers.onGoToProfile = () =>
    dispatch({ type: CONST.ENTER_PROFILE_VIEW });

  // Navigace na lekce
  handlers.onGoToLessons = () =>
    dispatch({ type: CONST.ENTER_LESSON_LIST });

  // Per-rezervace handlery
  handlers.reservationHandlers = reservationCapabilities.map((caps) => {
    const resHandlers = { reservationId: caps.reservationId };

    if (caps.canConfirm) {
      resHandlers.onConfirm = (reservationId) =>
        dispatch({ type: CONST.CONFIRM_RESERVATION, payload: { reservationId } });
    }

    if (caps.canCancel) {
      resHandlers.onCancel = (reservationId) =>
        dispatch({ type: CONST.CANCEL_RESERVATION, payload: { reservationId } });
    }

    return resHandlers;
  });

  return handlers;
}
