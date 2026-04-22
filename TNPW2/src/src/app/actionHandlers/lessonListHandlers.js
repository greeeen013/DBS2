// IR07 – Handler factory pro pohled LessonListView.
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

  // Filtrování lekcí
  handlers.onSetFilter = (filter) =>
    dispatch({ type: CONST.SET_LESSON_FILTER, payload: { filter } });

  // Per-lekce handlery – sestaveny dle lessonCapabilities pole z IR05 selektoru
  handlers.lessonHandlers = lessonCapabilities.map((caps, idx) => {
    const lessonHandlers = { lessonId: caps.lessonId };

    lessonHandlers.onDetail = (lessonId) =>
      dispatch({ type: CONST.ENTER_LESSON_DETAIL, payload: { lessonId } });

    if (caps.canOpen) {
      lessonHandlers.onOpen = (lessonId) =>
        dispatch({ type: CONST.OPEN_LESSON, payload: { lessonId } });
    }

    if (caps.canCancel) {
      lessonHandlers.onCancel = (lessonId) => {
        if (!window.confirm('Opravdu chcete zrušit lekci? Všem přihlášeným účastníkům budou vráceny kredity.')) return;
        dispatch({ type: CONST.CANCEL_LESSON, payload: { lessonId } });
      };
    }

    if (caps.canClose) {
      lessonHandlers.onClose = (lessonId) => {
        if (!window.confirm('Uzavřít lekci? Lekce bude označena jako dokončená a bude možné zapsat docházku. Přihlášeným účastníkům kredity zůstanou.')) return;
        dispatch({ type: CONST.CLOSE_LESSON, payload: { lessonId } });
      };
    }

    if (caps.canSetAttendance) {
      lessonHandlers.onSetAttendance = (lessonId) =>
        dispatch({ type: CONST.ENTER_LESSON_ATTENDANCE, payload: { lessonId } });
    }

    if (caps.canReopen) {
      lessonHandlers.onReopen = (lessonId) =>
        dispatch({ type: CONST.REOPEN_LESSON, payload: { lessonId } });
    }

    if (caps.canEnroll) {
      lessonHandlers.onEnroll = (lessonId) =>
        dispatch({ type: CONST.ENROLL_LESSON, payload: { lessonId } });
    }

    if (caps.canUnenroll) {
      lessonHandlers.onUnenroll = (lessonId) => {
        if (!window.confirm('Odhlásit se z lekce?')) return;
        dispatch({ type: CONST.UNENROLL_LESSON, payload: { reservationId: caps.userReservationId } });
      };
    }

    return lessonHandlers;
  });

  return handlers;
}
