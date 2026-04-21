import * as STATUS from '../../statuses.js';

export async function reopenLesson({ store, api, payload }) {
  const { lessonId } = payload;

  store.setState((state) => ({
    ...state,
    ui: { ...state.ui, status: STATUS.LOAD, notification: null },
  }));

  try {
    await api.lessons.updateStatus(lessonId, 'OPEN');
    const currentDetail = store.getState().lessonDetail;
    const needsDetailRefresh = currentDetail?.lesson_schedule_id === lessonId;
    const [lekce, updatedDetail] = await Promise.all([
      api.lessons.getAll(),
      needsDetailRefresh ? api.lessons.getDetail(lessonId) : Promise.resolve(currentDetail),
    ]);

    store.setState((state) => ({
      ...state,
      lessons: lekce,
      lessonDetail: needsDetailRefresh ? updatedDetail : state.lessonDetail,
      ui: {
        ...state.ui,
        status: STATUS.RDY,
        notification: { type: STATUS.OK, message: 'Lekce byla znovu otevřena.' },
      },
    }));
  } catch (error) {
    store.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        status: STATUS.RDY,
        notification: { type: STATUS.WAR, message: error.message ?? 'Znovu otevření lekce selhalo.' },
      },
    }));
  }
}
