// Handler factory pro pohled ProfileView.
//
// Vytváří handlery pro profil uživatele s historií.
// Pohled dostane jen funkci onGoToReservations – neví nic o dispatch/konstantách.

import * as CONST from '../../constants.js';

/**
 * Vytvoří handlery pro pohled profilu / historie.
 *
 * @param {Function} dispatch  - Dispatchovací funkce z createDispatcher
 * @param {Object}   viewState - View-state (pro budoucí rozšíření)
 * @returns {Object}           - Handlery pro ProfileView
 */
export function profileHandlers(dispatch, viewState) {
  const handlers = {};

  // Navigace zpět na rezervace
  handlers.onGoToReservations = () =>
    dispatch({ type: CONST.ENTER_RESERVATION_LIST });

  return handlers;
}
