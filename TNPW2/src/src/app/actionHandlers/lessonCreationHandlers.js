import * as CONST from '../../constants.js';

export function lessonCreationHandlers(dispatch, viewState) {
  const handlers = {};

  // onSubmit dostane { lessonData, recurrence } – createLesson sám naviguje na seznam po dokončení
  handlers.onSubmit = ({ lessonData, recurrence }) => {
    dispatch({ type: CONST.CREATE_LESSON, payload: { lessonData, recurrence } });
  };

  handlers.onCancel = () =>
    dispatch({ type: CONST.ENTER_LESSON_LIST });

  handlers.onSaveTemplate = (templateData) =>
    dispatch({ type: CONST.SAVE_LESSON_TEMPLATE, payload: { templateData } });

  return handlers;
}
