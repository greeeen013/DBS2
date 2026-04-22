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
    const detail = await api.lessons.getDetail(lessonId);
    store.setState((state) => ({
      ...state,
      lessonDetail: detail,
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
