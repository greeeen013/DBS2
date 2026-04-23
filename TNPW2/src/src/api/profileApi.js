// API modul pro profil přihlášeného člena (IR04).
//
// Volá GET /me/history – self-service endpoint, žádné member_id v URL.
// Backend určuje identitu z JWT tokenu v Authorization hlavičce.

import { apiFetch } from './httpClient.js';

export function createProfileApi() {
  return {
    getHistory() {
      return apiFetch('/me/history');
    },

    getProfile() {
      return apiFetch('/me');
    },

    uploadPhoto(file) {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('token');
      return fetch('http://localhost:8000/me/photo', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }).then((res) => {
        if (!res.ok) return res.json().then((e) => Promise.reject(new Error(e.detail ?? 'Chyba nahrávání')));
        return res.json();
      });
    },
  };
}
