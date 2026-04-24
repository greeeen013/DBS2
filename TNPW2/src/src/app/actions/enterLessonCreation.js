import * as CONST from '../../constants.js';
import * as STATUS from '../../statuses.js';

export async function enterLessonCreation({ store, api }) {
  if (typeof history !== 'undefined') history.pushState({}, '', '/lessons/create');

  store.setState((state) => ({
    ...state,
    ui: { ...state.ui, status: STATUS.LOAD },
  }));

  try {
    const isAdmin = store.getState().auth?.role === 'admin';
    const [trainers, templates, tariffs, archivedTariffs] = await Promise.all([
      api.lessons.getTrainers(),
      api.lessons.getTemplates(),
      api.memberships.fetchTariffs(),
      isAdmin ? api.memberships.fetchArchivedTariffs() : Promise.resolve([]),
    ]);
    store.setState((state) => ({
      ...state,
      trainers,
      lessonTemplates: templates,
      tariffs,
      archivedTariffs,
      ui: { ...state.ui, mode: CONST.LESSON_CREATION_VIEW, status: STATUS.RDY },
    }));
  } catch {
    store.setState((state) => ({
      ...state,
      trainers: [],
      lessonTemplates: [],
      tariffs: [],
      archivedTariffs: [],
      ui: { ...state.ui, mode: CONST.LESSON_CREATION_VIEW, status: STATUS.RDY },
    }));
  }
}
