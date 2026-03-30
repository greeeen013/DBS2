// API modul pro práci s platbami a kreditovým účtem.

import { apiFetch } from './httpClient.js';

export function createPaymentsApi() {
  return {
    /**
     * Načte historii plateb pro daného člena.
     * GET /payments/member/{memberId}
     */
    getHistory(memberId) {
      return apiFetch(`/payments/member/${memberId}`);
    },

    /**
     * Vytvoří novou platbu ve stavu PENDING.
     * POST /payments/
     */
    create(data) {
      return apiFetch('/payments/', {
        method: 'POST',
        body: data,
      });
    },

    /**
     * Změní stav platby (COMPLETED přičte kredity, FAILED nic, REFUNDED odečte).
     * PATCH /payments/{id}/status
     */
    updateStatus(paymentId, status) {
      return apiFetch(`/payments/${paymentId}/status`, {
        method: 'PATCH',
        body: { status },
      });
    },

    /**
     * Načte aktuální kreditový zůstatek člena.
     * GET /members/{memberId}/balance
     */
    getBalance(memberId) {
      return apiFetch(`/members/${memberId}/balance`);
    },
  };
}
