import { apiFetch } from './httpClient.js';

export function createMembershipsApi() {
  return {
    fetchTariffs: () =>
      apiFetch('/tariffs', { method: 'GET' }),

    createTariff: (data) =>
      apiFetch('/tariffs', { method: 'POST', body: JSON.stringify(data) }),

    fetchMyMemberships: () =>
      apiFetch('/memberships/me', { method: 'GET' }),

    purchaseMembership: (tariff_id) =>
      apiFetch('/memberships', { method: 'POST', body: JSON.stringify({ tariff_id }) }),

    deleteTariff: (tariff_id) =>
      apiFetch(`/tariffs/${tariff_id}`, { method: 'DELETE' }),
  };
}
