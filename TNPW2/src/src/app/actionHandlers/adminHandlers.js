// Handler factory pro pohled AdminView.
//
// Vytváří handlery pro admin správu čekajících plateb.
// Pohled dostane funkce (onGoToReservations, onApprovePayment, onRejectPayment) –
// neví nic o konkrétních dispatch voláních ani konstantách akcí.

import * as CONST from '../../constants.js';

/**
 * Vytvoří handlery pro admin pohled (správa plateb).
 *
 * @param {Function} dispatch  - Dispatchovací funkce z createDispatcher
 * @param {Object}   viewState - View-state (pro budoucí rozšíření)
 * @returns {Object}           - Handlery pro AdminView
 */
export function adminHandlers(dispatch, viewState) {
  const handlers = {};

  // Navigace zpět na rezervace
  handlers.onGoToReservations = () =>
    dispatch({ type: CONST.ENTER_RESERVATION_LIST });

  // Schválení platby
  handlers.onApprovePayment = (paymentId) =>
    dispatch({ type: CONST.APPROVE_PAYMENT, payload: { paymentId } });

  // Zamítnutí platby
  handlers.onRejectPayment = (paymentId) =>
    dispatch({ type: CONST.REJECT_PAYMENT, payload: { paymentId } });

  return handlers;
}
