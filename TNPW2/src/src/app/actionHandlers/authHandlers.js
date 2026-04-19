// Handler factory pro pohled AuthView.
//
// Vytváří handlery pro přihlašovací a registrační formulář.
// Pohled dostane funkce (onLogin, onRegister) –
// neví nic o konkrétních dispatch voláních ani konstantách akcí.

import * as CONST from '../../constants.js';

/**
 * Vytvoří handlery pro přihlašovací/registrační pohled.
 *
 * @param {Function} dispatch  - Dispatchovací funkce z createDispatcher
 * @param {Object}   viewState - View-state (pro budoucí rozšíření)
 * @returns {Object}           - Handlery pro AuthView
 */
export function authHandlers(dispatch, viewState) {
  const handlers = {};

  // Přihlášení – pohled předá email + heslo, handler zavolá dispatch
  handlers.onLogin = ({ email, password }) =>
    dispatch({ type: CONST.LOGIN, payload: { email, password } });

  // Registrace – pohled předá jméno, příjmení, email, heslo
  handlers.onRegister = ({ name, surname, email, password }) =>
    dispatch({ type: CONST.REGISTER, payload: { name, surname, email, password } });

  return handlers;
}
