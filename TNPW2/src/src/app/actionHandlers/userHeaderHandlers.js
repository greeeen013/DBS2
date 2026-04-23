// Handler factory pro uživatelskou lištu (navbar).
//
// Vytváří handlery pro navigační lištu s odhlášením a admin přístupem.
// Lišta dostane funkce (onLogout, onGoToAdmin) –
// neví nic o konkrétních dispatch voláních ani konstantách akcí.

import * as CONST from '../../constants.js';

/**
 * Vytvoří handlery pro uživatelskou navigační lištu.
 *
 * @param {Function} dispatch  - Dispatchovací funkce z createDispatcher
 * @param {Object}   auth      - Autentizační údaje uživatele (role apod.)
 * @returns {Object}           - Handlery pro uživatelský header
 */
export function userHeaderHandlers(dispatch, auth) {
  const handlers = {};

  // Odhlášení
  handlers.onLogout = () =>
    dispatch({ type: CONST.LOGOUT });

  // Navigace do admin sekce – jen pro adminy (IR07: handler existuje vždy,
  // ale UI ho zobrazí jen pokud auth.role === 'admin')
  handlers.onGoToAdmin = () =>
    dispatch({ type: CONST.ENTER_ADMIN_VIEW });

  handlers.onGoToPermits = () =>
    dispatch({ type: CONST.ENTER_PERMITS });

  return handlers;
}
