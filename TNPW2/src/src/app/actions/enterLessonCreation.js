import * as CONST from '../../constants.js';
import * as STATUS from '../../statuses.js';

export async function enterLessonCreation({ store, api }) {
  if (typeof history !== 'undefined') history.pushState({}, '', '/lessons/create');

  store.setState((state) => ({
    ...state,
    ui: { ...state.ui, status: STATUS.LOAD },
  }));

  try {
    const [trainers, templates] = await Promise.all([
      api.lessons.getTrainers(),
      api.lessons.getTemplates(),
    ]);
    store.setState((state) => ({
      ...state,
      trainers,
      lessonTemplates: templates,
      ui: { ...state.ui, mode: CONST.LESSON_CREATION_VIEW, status: STATUS.RDY },
    }));
  } catch {
    store.setState((state) => ({
      ...state,
      trainers: [],
      lessonTemplates: [],
      ui: { ...state.ui, mode: CONST.LESSON_CREATION_VIEW, status: STATUS.RDY },
    }));
  }
}
