import * as CONST from '../../constants.js';

export function lessonDetailHandlers(dispatch, viewState) {
  const handlers = {
    onBack: () => dispatch({ type: CONST.ENTER_LESSON_LIST }),
  };

  if (viewState.canEnroll && viewState.lesson) {
    handlers.onEnroll = () =>
      dispatch({ type: CONST.ENROLL_LESSON, payload: { lessonId: viewState.lesson.lesson_schedule_id } });
  }

  if (viewState.canUnenroll && viewState.userReservationId) {
    handlers.onUnenroll = () =>
      dispatch({ type: CONST.UNENROLL_LESSON, payload: { reservationId: viewState.userReservationId } });
  }

  if (viewState.canReopen && viewState.lesson) {
    handlers.onReopen = () =>
      dispatch({ type: CONST.REOPEN_LESSON, payload: { lessonId: viewState.lesson.lesson_schedule_id } });
  }

  if (viewState.canOpen && viewState.lesson) {
    handlers.onOpen = () =>
      dispatch({ type: CONST.OPEN_LESSON, payload: { lessonId: viewState.lesson.lesson_schedule_id } });
  }

  if (viewState.canCancel && viewState.lesson) {
    handlers.onCancel = () =>
      dispatch({ type: CONST.CANCEL_LESSON, payload: { lessonId: viewState.lesson.lesson_schedule_id } });
  }

  if (viewState.canClose && viewState.lesson) {
    handlers.onClose = () =>
      dispatch({ type: CONST.CLOSE_LESSON, payload: { lessonId: viewState.lesson.lesson_schedule_id } });
  }

  if (viewState.canSetAttendance && viewState.lesson) {
    handlers.onSetAttendance = () =>
      dispatch({ type: CONST.ENTER_LESSON_ATTENDANCE, payload: { lessonId: viewState.lesson.lesson_schedule_id } });
  }

  return handlers;
}
