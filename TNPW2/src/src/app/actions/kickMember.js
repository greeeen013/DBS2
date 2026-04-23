import * as STATUS from '../../statuses.js';
import * as CONST from '../../constants.js';

export async function kickMember({ store, api, payload }) {
  const { lessonId, reservationId, memberName } = payload;

  try {
    await api.lessons.kickMember(lessonId, reservationId);

    // Obnov seznam přihlášených po vyhození
    const enrollees = await api.lessons.getAttendees(lessonId).catch(() => []);
    const detail = await api.lessons.getDetail(lessonId);

    store.setState((state) => ({
      ...state,
      lessonDetail: detail,
      lessonEnrollees: enrollees,
      ui: {
        ...state.ui,
        notification: { type: STATUS.OK, message: `${memberName ?? 'Člen'} byl vyhozen z lekce.` },
      },
    }));
  } catch (error) {
    alert(`Vyhození selhalo: ${error.message ?? 'Neznámá chyba'}`);
  }
}
