// API modul pro admin operace.

import { apiFetch } from './httpClient.js';

export function createAdminApi() {
  return {
    /**
     * Načte všechny platby ve stavu PENDING.
     * GET /payments/pending  (admin only)
     */
    getPendingPayments() {
      return apiFetch('/payments/pending');
    },

    /**
     * Schválí platbu – přechod PENDING → COMPLETED.
     * PATCH /payments/{id}/status
     */
    approvePayment(paymentId) {
      return apiFetch(`/payments/${paymentId}/status`, {
        method: 'PATCH',
        body: { status: 'COMPLETED' },
      });
    },

    /**
     * Zamítne platbu – přechod PENDING → FAILED.
     * PATCH /payments/{id}/status
     */
    rejectPayment(paymentId) {
      return apiFetch(`/payments/${paymentId}/status`, {
        method: 'PATCH',
        body: { status: 'FAILED' },
      });
    },
  };
}
