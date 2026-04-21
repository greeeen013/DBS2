// Akce: zahájení nebo ukončení lekce (přechod do IN_PROGRESS nebo COMPLETED)

import * as STATUS from '../../statuses.js';

export async function closeLesson({ store, api, payload }) {
    const { lessonId, newStatus = 'COMPLETED' } = payload;

    store.setState((state) => ({
        ...state,
        ui: { ...state.ui, status: STATUS.LOAD, notification: null },
    }));

    try {
        await api.lessons.updateStatus(lessonId, newStatus);
        const memberId = store.getState().auth.memberId;
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
