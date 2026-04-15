// Akce: zahájení nebo ukončení lekce (přechod do IN_PROGRESS nebo COMPLETED)

import * as STATUS from '../../statuses.js';

export async function closeLesson({ store, api, payload }) {
    const { lessonId, newStatus } = payload; // 'IN_PROGRESS' nebo 'COMPLETED'

    store.setState((state) => ({
        ...state,
        ui: { ...state.ui, status: STATUS.LOAD, notification: null },
    }));

    try {
        const result = await api.lessons.updateStatus(lessonId, newStatus);

        store.setState((state) => ({
            ...state,
            lessons: (state.lessons || []).map((l) =>
                l.lesson_id === result.lesson_id ? result : l
            ),
            ui: {
                ...state.ui,
                status: STATUS.RDY,
                notification: {
                    type: STATUS.OK,
                    message: newStatus === 'COMPLETED'
                        ? 'Lekce byla úspěšně ukončena.'
                        : 'Lekce právě probíhá.',
                },
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
