import { apiFetch } from './httpClient.js';

export function createStatsApi() {
  return {
    getScheduleCapacity: () =>
      apiFetch('/stats/schedule-capacity', { method: 'GET' }),

    getMembersNoMembership: () =>
      apiFetch('/stats/members-no-membership', { method: 'GET' }),

    getTrainerStats: () =>
      apiFetch('/stats/trainer-stats', { method: 'GET' }),
  };
}
