// Akce: zveřejnění lekce (přechod do stavu OPEN)

import * as STATUS from '../../statuses.js';

export async function openLesson({ store, api, payload }) {
  const { lessonId } = payload;

  store.setState((state) => ({
    ...state,
    ui: { ...state.ui, status: STATUS.LOAD, notification: null },
  }));

  try {
    await api.lessons.updateStatus(lessonId, 'OPEN');
    const lekce = await api.lessons.getAll();

    store.setState((state) => ({
      ...state,
      lessons: lekce,
      ui: {
        ...state.ui,
        status: STATUS.RDY,
        notification: { type: STATUS.OK, message: 'Lekce byla zveřejněna.' },
      },
    }));
  } catch (error) {
    store.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        status: STATUS.RDY,
        notification: { type: STATUS.WAR, message: error.message },
      },
    }));
  }
}
