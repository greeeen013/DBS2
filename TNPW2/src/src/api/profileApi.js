// API modul pro profil přihlášeného člena (IR04).
//
// Volá GET /me/history – self-service endpoint, žádné member_id v URL.
// Backend určuje identitu z JWT tokenu v Authorization hlavičce.

import { apiFetch } from './httpClient.js';

export function createProfileApi() {
  return {
    /**
     * Načte kombinovanou historii přihlášeného člena.
     * GET /me/history
     * Odpověď: { reservations: [...], payments: [...] }
     */
    getHistory() {
      return apiFetch('/me/history');
    },
  };
}
