// API modul pro práci s lekcemi (Scheduled_Lesson).
//
// Endpointy odpovídají backendové REST API struktuře.
// Metody jsou konzistentní s tím, co volají akce v dispatch.js.

import { apiFetch } from './httpClient.js';

export function createLessonsApi() {
  return {
    /**
     * Načte seznam všech lekcí.
     * GET /lessons/
     */
    getAll() {
      return apiFetch('/lessons/');
    },

    /**
     * Vytvoří novou lekci (stav DRAFT).
     * POST /lessons/
     */
    create(lessonData) {
      return apiFetch('/lessons/', {
        method: 'POST',
        body: lessonData,
      });
    },

    /**
     * Změní stav lekce (OPEN / CANCELLED / IN_PROGRESS / COMPLETED).
     * PATCH /lessons/{id}/status
     */
    updateStatus(lessonId, status) {
      return apiFetch(`/lessons/${lessonId}/status`, {
        method: 'PATCH',
        body: { status },
      });
    },

    /**
     * Zapíše nebo upraví docházku člena na konkrétní lekci.
     * POST /lessons/{id}/attendance
     */
    setAttendance(lessonId, memberId, attended) {
      return apiFetch(`/lessons/${lessonId}/attendance`, {
        method: 'POST',
        body: { member_id: memberId, attended: attended },
      });
    },
  };
}
