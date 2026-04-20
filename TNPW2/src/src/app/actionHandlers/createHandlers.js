// IR07 – Centrální továrna handlerů (Handler factory).
//
// Zodpovědnost: na základě viewState.type vrátí správnou sadu handlerů.
// Odděluje "co zobrazit" (IR05 selektory) od "jak reagovat na interakci" (IR07).
//
// Vzor přejat z prepare/app/actionHandlers/createHandlers.js –
// tam je pojmenováno createHandlers(dispatch, viewState).
//
// Architektonická role:
//   render.js zavolá createHandlers(dispatch, viewState)
//   → dostane handlers objekt
//   → předá jej do View funkce jako { viewState, handlers }
//   → View NEVOLÁ dispatch přímo, jen využívá handlery

import { lessonListHandlers } from './lessonListHandlers.js';
import { lessonCreationHandlers } from './lessonCreationHandlers.js';
import { reservationListHandlers } from './reservationListHandlers.js';
import { paymentHandlers } from './paymentHandlers.js';
import { profileHandlers } from './profileHandlers.js';
import { adminHandlers } from './adminHandlers.js';
import { permitsHandlers } from './permitsHandlers.js';
import { authHandlers } from './authHandlers.js';
import { userHeaderHandlers } from './userHeaderHandlers.js';
import { errorHandlers } from './errorHandlers.js';
import * as CONST from '../../constants.js';

/**
 * Vytvoří správnou sadu handlerů pro aktuální pohled.
 *
 * @param {Function} dispatch   - Dispatchovací funkce z createDispatcher
 * @param {Object}   viewState  - Aktuální view-state ze selectViewState (IR05)
 * @returns {Object}            - Objekt handlerů specifický pro daný pohled
 */
export function createHandlers(dispatch, viewState) {
  switch (viewState.type) {
    case 'ERROR':
      return errorHandlers(dispatch, viewState);

    case CONST.LESSON_LIST:
      return lessonListHandlers(dispatch, viewState);

    case CONST.LESSON_CREATION_VIEW:
      return lessonCreationHandlers(dispatch, viewState);

    case CONST.RESERVATION_LIST:
      return reservationListHandlers(dispatch, viewState);

    case CONST.PAYMENT_VIEW:
      return paymentHandlers(dispatch, viewState);

    case CONST.PROFILE_VIEW:
      return profileHandlers(dispatch, viewState);

    case CONST.ADMIN_VIEW:
      return adminHandlers(dispatch, viewState);

    case CONST.PERMITS_VIEW:
      return permitsHandlers(dispatch, viewState);

    case CONST.AUTH_VIEW:
      return authHandlers(dispatch, viewState);

    // Pro meta-pohledy (LOADING, ERROR) vrátíme prázdný objekt –
    // nemají interaktivní prvky řízené handlery
    default:
      return {};
  }
}

/**
 * Vytvoří handlery pro uživatelskou navigační lištu.
 * Volá se odděleně od createHandlers, protože navbar je společný
 * pro všechny pohledy (není vázán na viewState.type).
 *
 * @param {Function} dispatch - Dispatchovací funkce z createDispatcher
 * @param {Object}   auth     - Autentizační údaje uživatele
 * @returns {Object}          - Handlery pro navigační lištu
 */
export function createHeaderHandlers(dispatch, auth) {
  return userHeaderHandlers(dispatch, auth);
}
