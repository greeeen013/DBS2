import * as STATUS from '../../statuses.js';

export async function createLesson({ store, api, payload }) {
  const { lessonData } = payload; // data nové lekce

  store.setState((state) => ({
    ...state,
    ui: { ...state.ui, status: STATUS.LOAD, notification: null },
  }));

  try {
    const result = await api.lessons.create(lessonData); // volání metod backendu / API

    store.setState((state) => ({
      ...state,
      lessons: [...(state.lessons || []), result],
      ui: {
        ...state.ui,
        status: STATUS.RDY,
        notification: { type: STATUS.OK, message: 'Lekce byla úspěšně vypsána.' },
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
