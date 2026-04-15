// Akce: aktualizace obsazenosti lekce

import * as STATUS from '../../statuses.js';

export async function updateLessonCapacity({ store, api, payload }) {
    const { lessonId, change } = payload; // change může být +1 nebo -1

    // Můžeme udělat okamžitou úpravu stavu
    store.setState((state) => {
        const lessons = state.lessons || [];
        const updatedLessons = lessons.map((l) => {
            if (l.lesson_id === lessonId) {
                const newCount = (l.registered_members || 0) + change;
                const newStatus = newCount >= l.maximal_capacity ? 'FULL' : 'OPEN';
                return { ...l, registered_members: newCount, status: newStatus };
            }
            return l;
        });

        return { ...state, lessons: updatedLessons };
    });
}
