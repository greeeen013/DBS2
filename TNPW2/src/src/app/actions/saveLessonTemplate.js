import * as STATUS from '../../statuses.js';

export async function saveLessonTemplate({ store, api, payload }) {
  const { templateData } = payload;

  store.setState((state) => ({
    ...state,
    ui: { ...state.ui, status: STATUS.LOAD, notification: null },
  }));

  try {
    const result = await api.lessons.createTemplate(templateData);
    store.setState((state) => ({
      ...state,
      lessonTemplates: [...(state.lessonTemplates || []), result],
      ui: {
        ...state.ui,
        status: STATUS.RDY,
        notification: { type: STATUS.OK, message: `Šablona "${result.name}" byla uložena.` },
      },
    }));
  } catch (error) {
    store.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        status: STATUS.RDY,
        notification: { type: STATUS.WAR, message: error.message ?? 'Uložení šablony selhalo.' },
      },
    }));
  }
}
