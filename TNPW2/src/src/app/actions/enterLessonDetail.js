import * as CONST from '../../constants.js';
import * as STATUS from '../../statuses.js';

export async function enterLessonDetail({ store, api, payload }) {
  const { lessonId } = payload;

  if (typeof history !== 'undefined') history.pushState({}, '', `/lessons/${lessonId}`);

  store.setState((state) => ({
    ...state,
    ui: { ...state.ui, status: STATUS.LOAD },
  }));

  try {
    const role = store.getState().auth?.role;
    const isStaff = role === 'trainer' || role === 'admin';

    const [detail, enrollees] = await Promise.all([
      api.lessons.getDetail(lessonId),
      isStaff ? api.lessons.getAttendees(lessonId).catch((err) => {
        // Uložíme chybu do stavu, aby se zobrazila jako notifikace ve view
        const msg = err?.message ?? 'Nepodařilo se načíst seznam účastníků.';
        store.setState((s) => ({
          ...s,
          ui: { ...s.ui, notification: { type: 'WARNING', message: msg } },
        }));
        return [];
      }) : Promise.resolve([]),
    ]);


    store.setState((state) => ({
      ...state,
      lessonDetail: detail,
      lessonEnrollees: enrollees,
      ui: { ...state.ui, mode: CONST.LESSON_DETAIL, status: STATUS.RDY },
    }));
  } catch (error) {
    store.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        status: STATUS.ERR,
        errorMessage: error.message ?? 'Nepodařilo se načíst detail lekce.',
      },
    }));
  }
}
