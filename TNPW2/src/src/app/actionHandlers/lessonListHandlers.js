// IR06 – Handler factory pro pohled LessonListView.
//
// Vrací objekt handlerů sestavený POUZE z akcí, které jsou povoleny
// dle capabilities předaných z IR05 selektoru.
// Pohled (LessonListView) tyto handlery jen volá – nerozhoduje sám,
// co je povoleno.
//
// Vzor převzat z prepare/app/actionHandlers/examTermListHandlers.js.

import * as CONST from '../../constants.js';

/**
 * Vytvoří handlery pro pohled se seznamem lekcí.
 *
 * @param {Function} dispatch     - Dispatchovací funkce z createDispatcher
 * @param {Object}   viewState    - View-state připravený selektorem IR05
 * @returns {Object}              - Handlery vázané na dispatch (jen povolené)
 */
export function lessonListHandlers(dispatch, viewState) {
  const { capabilities = {}, lessonCapabilities = [] } = viewState;

  const handlers = {};

  // Navigace zpět na rezervace – vždy povolena (všichni přihlášení uživatelé)
  handlers.onGoToReservations = () =>
    dispatch({ type: CONST.ENTER_RESERVATION_LIST });

  // Vytvoření nové lekce – jen pro trainer/admin (dle capabilities.canCreateLesson)
  if (capabilities.canCreateLesson) {
    handlers.onCreateLesson = () =>
      dispatch({ type: CONST.ENTER_LESSON_CREATION });
  }

  // Per-lekce handlery – sestaveny dle lessonCapabilities pole z IR05 selektoru
  handlers.lessonHandlers = lessonCapabilities.map((caps, idx) => {
    const lessonHandlers = { lessonId: caps.lessonId };

    if (caps.canOpen) {
      lessonHandlers.onOpen = (lessonId) =>
        dispatch({ type: CONST.OPEN_LESSON, payload: { lessonId } });
    }

    if (caps.canCancel) {
      lessonHandlers.onCancel = (lessonId) =>
        dispatch({ type: CONST.CANCEL_LESSON, payload: { lessonId } });
    }

    if (caps.canClose) {
      lessonHandlers.onClose = (lessonId) =>
        dispatch({ type: CONST.CLOSE_LESSON, payload: { lessonId } });
    }

    if (caps.canSetAttendance) {
      lessonHandlers.onSetAttendance = (lessonId) =>
        dispatch({ type: CONST.SET_ATTENDANCE, payload: { lessonId } });
    }

    return lessonHandlers;
  });

  return handlers;
}
