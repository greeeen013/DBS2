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

    /**
     * Načte detail jedné lekce včetně počtu přihlášených.
     * GET /lessons/{id}
     */
    getDetail(lessonId) {
      return apiFetch(`/lessons/${lessonId}`);
    },

    /**
     * Načte seznam trenérů (zaměstnanců) se jménem a příjmením.
     * GET /lessons/trainers/
     */
    getTrainers() {
      return apiFetch('/lessons/trainers/');
    },

    /**
     * Načte seznam šablon lekcí.
     * GET /lessons/templates/
     */
    getTemplates() {
      return apiFetch('/lessons/templates/');
    },

    /**
     * Načte seznam typů lekcí.
     * GET /lessons/types/
     */
    getLessonTypes() {
      return apiFetch('/lessons/types/');
    },

    /**
     * Načte seznam účastníků lekce.
     * GET /lessons/{id}/attendees
     */
    getAttendees(lessonId) {
      return apiFetch(`/lessons/${lessonId}/attendees`);
    },

    /**
     * Hromadně uloží docházku pro lekci.
     * POST /lessons/{id}/team-attendance
     */
    saveTeamAttendance(lessonId, members) {
      return apiFetch(`/lessons/${lessonId}/team-attendance`, {
        method: 'POST',
        body: { members },
      });
    },

    /**
     * Vytvoří novou šablonu lekce (preset).
     * POST /lessons/templates/
     */
    createTemplate(templateData) {
      return apiFetch('/lessons/templates/', {
        method: 'POST',
        body: templateData,
      });
    },

    /**
     * Vyhodí člena z lekce (zruší jeho rezervaci).
     * DELETE /lessons/{id}/enrollments/{reservationId}
     */
    kickMember(lessonId, reservationId) {
      return apiFetch(`/lessons/${lessonId}/enrollments/${reservationId}`, {
        method: 'DELETE',
      });
    },
  };
}
