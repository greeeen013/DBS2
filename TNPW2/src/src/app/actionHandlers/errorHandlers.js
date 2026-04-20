// Handler factory pro chybový pohled (ErrorView).
//
// Vytváří handlery pro návrat z chybového stavu.
// Pohled dostane jen funkci onContinue – neví nic o dispatch/konstantách.

import * as CONST from '../../constants.js';

/**
 * Vytvoří handlery pro chybový pohled.
 *
 * @param {Function} dispatch  - Dispatchovací funkce
 * @param {Object}   viewState - View-state
 * @returns {Object}           - Handlery pro ErrorView
 */
export function errorHandlers(dispatch, viewState) {
  const handlers = {};

  // Návrat z chyby
  handlers.onContinue = () =>
    dispatch({ type: CONST.RECOVER_FROM_ERROR });

  return handlers;
}
