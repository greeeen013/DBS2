import * as CONST from '../../constants.js';
import * as STATUS from '../../statuses.js';

export async function enterLessonList({ store, api }) {
  if (typeof history !== 'undefined') history.pushState({}, '', '/lessons');

  store.setState((state) => ({
    ...state,
    ui: { ...state.ui, status: STATUS.LOAD },
  }));

  try {
    const lekce = await api.lessons.getAll();
    store.setState((state) => ({
      ...state,
      lessons: lekce,
      ui: { ...state.ui, mode: CONST.LESSON_LIST, status: STATUS.RDY },
    }));
  } catch {
    store.setState((state) => ({
      ...state,
      ui: { ...state.ui, mode: CONST.LESSON_LIST, status: STATUS.RDY },
    }));
  }
}
