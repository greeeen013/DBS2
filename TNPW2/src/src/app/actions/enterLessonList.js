import * as CONST from '../../constants.js';
import * as STATUS from '../../statuses.js';

export async function enterLessonList({ store, api }) {
  if (typeof history !== 'undefined') history.pushState({}, '', '/lessons');

  store.setState((state) => ({
    ...state,
    ui: { ...state.ui, status: STATUS.LOAD },
  }));

  try {
    const memberId = store.getState().auth.memberId;
    const [lekce, trainers, lessonTypes, tariffs, memberships, rezervace] = await Promise.all([
      api.lessons.getAll(),
      api.lessons.getTrainers(),
      api.lessons.getLessonTypes(),
      api.memberships.fetchTariffs(),
      api.memberships.fetchMyMemberships(),
      memberId ? api.reservations.getAll(memberId) : Promise.resolve([]),
    ]);
    store.setState((state) => ({
      ...state,
      lessons: lekce,
      trainers,
      lessonTypes,
      tariffs,
      memberships,
      reservations: rezervace,
      ui: { ...state.ui, mode: CONST.LESSON_LIST, status: STATUS.RDY },
    }));
  } catch {
    store.setState((state) => ({
      ...state,
      ui: { ...state.ui, mode: CONST.LESSON_LIST, status: STATUS.RDY },
    }));
  }
}
