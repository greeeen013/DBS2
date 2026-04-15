import * as STATUS from '../../statuses.js';

// Akce: zapsání docházky člena přes API
export async function setAttendance({ store, api, payload }) {
    const { lessonId, memberId, attended } = payload;

    // Optimistická aktualizace lokálního stavu – okamžitě zapíšeme docházku
    // bez čekání na API (stejný vzor jako updateLessonCapacity).
    store.setState((state) => {
        const attendances = state.attendances || [];
        const updatedAttendances = attendances.filter(
            (a) => !(a.lessonId === lessonId && a.memberId === memberId)
        );
        updatedAttendances.push({ lessonId, memberId, attended });

        return {
            ...state,
            attendances: updatedAttendances,
            ui: { ...(state.ui ?? {}), status: STATUS.LOAD, notification: null },
        };
    });

    try {
        // Synchronizace se serverem (IR03)
        await api.lessons?.setAttendance(lessonId, memberId, attended);

        store.setState((state) => ({
            ...state,
            ui: {
                ...(state.ui ?? {}),
                status: STATUS.RDY,
                notification: { type: STATUS.OK, message: 'Docházka byla zapsána.' },
            },
        }));
    } catch (error) {
        // API selhalo – lokální stav zůstane (optimistický zápis), jen oznámíme chybu
        store.setState((state) => ({
            ...state,
            ui: {
                ...(state.ui ?? {}),
                status: STATUS.RDY,
                notification: { type: STATUS.WAR, message: error.message },
            },
        }));
    }
}
