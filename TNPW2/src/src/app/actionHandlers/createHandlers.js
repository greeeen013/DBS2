// IR06 – Centrální továrna handlerů (Handler factory).
//
// Zodpovědnost: na základě viewState.type vrátí správnou sadu handlerů.
// Odděluje "co zobrazit" (IR05 selektory) od "jak se zobrazí" (IR06 render).
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
    case CONST.LESSON_LIST:
      return lessonListHandlers(dispatch, viewState);

    case CONST.LESSON_CREATION_VIEW:
      return lessonCreationHandlers(dispatch, viewState);

    case CONST.RESERVATION_LIST:
      return reservationListHandlers(dispatch, viewState);

    // Pro ostatní pohledy (AUTH_VIEW, ADMIN_VIEW atd.) vrátíme prázdný objekt –
    // ty si stále předávají dispatch přímo (nejsou součástí IR06 odpovědnosti)
    default:
      return {};
  }
}
