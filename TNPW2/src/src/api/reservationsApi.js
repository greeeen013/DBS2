// API modul pro práci s rezervacemi.
//
// Každá funkce volá apiFetch() z httpClient.js – tím se odděluji od konkrétní
// implementace HTTP vrstvy. Pokud by se změnila URL backendu, upravím jen BASE_URL
// v httpClient.js, ne každou funkci zvlášť.

import { apiFetch } from './httpClient.js';

export function createReservationsApi() {
  return {
    /**
     * Načte seznam rezervací pro daného člena.
     * GET /reservations/?member_id={memberId}
     */
    getAll(memberId) {
      return apiFetch(`/reservations/?member_id=${memberId}`);
    },

    /**
     * Vytvoří novou rezervaci (stav CREATED).
     * POST /reservations/
     */
    create(data) {
      return apiFetch('/reservations/', {
        method: 'POST',
        body: data,
      });
    },

    /**
     * Změní stav rezervace (CONFIRMED / CANCELLED / ATTENDED).
     * PATCH /reservations/{id}/status
     * Odpověď obsahuje i nový kreditový zůstatek (credit_balance).
     */
    updateStatus(reservationId, status) {
      return apiFetch(`/reservations/${reservationId}/status`, {
        method: 'PATCH',
        body: { status },
      });
    },
  };
}
