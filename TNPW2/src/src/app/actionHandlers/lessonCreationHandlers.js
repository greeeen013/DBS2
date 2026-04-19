// IR06 – Handler factory pro pohled LessonCreationView.
//
// Vytváří handlery pro formulář tvorby lekce.
// Pohled dostane jen funkce (onSubmit, onCancel) – neví nic o konkrétních
// dispatch voláních ani konstantách akcí.

import * as CONST from '../../constants.js';

/**
 * Vytvoří handlery pro pohled vytváření nové lekce.
 *
 * @param {Function} dispatch  - Dispatchovací funkce
 * @param {Object}   viewState - View-state (pro budoucí rozšíření)
 * @returns {Object}           - Handlery pro formulář
 */
export function lessonCreationHandlers(dispatch, viewState) {
  const handlers = {};

  // Odeslání formuláře → spustí CREATE_LESSON akci a přejde na seznam
  handlers.onSubmit = (lessonData) => {
    dispatch({ type: CONST.CREATE_LESSON, payload: { lessonData } });
    dispatch({ type: CONST.ENTER_LESSON_LIST });
  };

  // Zrušení → návrat na seznam bez uložení
  handlers.onCancel = () =>
    dispatch({ type: CONST.ENTER_LESSON_LIST });

  return handlers;
}
