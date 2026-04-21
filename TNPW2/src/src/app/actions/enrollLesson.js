import * as STATUS from '../../statuses.js';
import * as CONST from '../../constants.js';

export async function enrollLesson({ store, api, payload }) {
  const { lessonId } = payload;
  const memberId = store.getState().auth.memberId;

  store.setState((state) => ({
    ...state,
    ui: { ...state.ui, status: STATUS.LOAD, notification: null },
  }));

  try {
    const reservation = await api.reservations.create({
      member_id: memberId,
      lesson_schedule_id: lessonId,
    });

    // Refresh lessons list and reservations to reflect new enrollment count
    const [lekce, rezervace] = await Promise.all([
      api.lessons.getAll(),
      api.reservations.getAll(memberId),
    ]);

    store.setState((state) => ({
      ...state,
      lessons: lekce,
      reservations: rezervace,
      ui: {
        ...state.ui,
        status: STATUS.RDY,
        notification: { type: STATUS.OK, message: 'Přihlášení na lekci proběhlo úspěšně.' },
      },
    }));
  } catch (error) {
    store.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        status: STATUS.RDY,
        notification: { type: STATUS.WAR, message: error.message ?? 'Přihlášení na lekci selhalo.' },
      },
    }));
  }
}
