// Handler factory pro pohled PaymentView.
//
// Vytváří handlery pro formulář dobití kreditů.
// Pohled dostane jen funkce (onSubmitPayment, onGoToReservations) –
// neví nic o konkrétních dispatch voláních ani konstantách akcí.
//
// Architektonická role:
//   render.js zavolá createHandlers(dispatch, viewState)
//   → createHandlers deleguje na paymentHandlers()
//   → pohled dostane { handlers } a volá jen handlers.onSubmitPayment(amount)

import * as CONST from '../../constants.js';

/**
 * Vytvoří handlery pro pohled dobití kreditů.
 *
 * @param {Function} dispatch  - Dispatchovací funkce z createDispatcher
 * @param {Object}   viewState - View-state (pro budoucí rozšíření)
 * @returns {Object}           - Handlery pro PaymentView
 */
export function paymentHandlers(dispatch, viewState) {
  const handlers = {};

  // Odeslání platby → CREATE_PAYMENT akce
  handlers.onSubmitPayment = (amount) =>
    dispatch({ type: CONST.CREATE_PAYMENT, payload: { amount } });

  // Navigace zpět na rezervace
  handlers.onGoToReservations = () =>
    dispatch({ type: CONST.ENTER_RESERVATION_LIST });

  return handlers;
}
