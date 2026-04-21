import * as STATUS from '../../statuses.js';
import * as CONST from '../../constants.js';

export async function saveTeamAttendance({ store, api, payload }) {
  const { lessonId, members } = payload;
  store.setState((s) => ({ ...s, ui: { ...s.ui, status: STATUS.LOAD, notification: null } }));
  try {
    await api.lessons.saveTeamAttendance(lessonId, members);
    // Re-fetch lesson detail so the detail view is up to date
    const detail = await api.lessons.getDetail(lessonId);
    store.setState((s) => ({
      ...s,
      lessonDetail: detail,
      ui: {
        ...s.ui,
        status: STATUS.RDY,
        mode: CONST.LESSON_DETAIL,
        notification: { type: STATUS.OK, message: 'Docházka byla uložena.' },
      },
    }));
  } catch (error) {
    store.setState((s) => ({
      ...s,
      ui: {
        ...s.ui,
        status: STATUS.RDY,
        notification: { type: STATUS.WAR, message: error.message ?? 'Uložení docházky selhalo.' },
      },
    }));
  }
}
