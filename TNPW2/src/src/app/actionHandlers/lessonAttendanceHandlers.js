import * as CONST from '../../constants.js';

export function lessonAttendanceHandlers(dispatch, viewState) {
  return {
    onBack: () => dispatch({ type: CONST.ENTER_LESSON_DETAIL, payload: { lessonId: viewState.lessonId } }),
    onSave: (members) => dispatch({ type: CONST.SAVE_TEAM_ATTENDANCE, payload: { lessonId: viewState.lessonId, members } }),
  };
}
