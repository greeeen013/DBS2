import { apiFetch } from './httpClient.js';

export function createAuthApi() {
  return {
    login(email, password) {
      return apiFetch('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
    },
    
    register(data) {
      return apiFetch('/auth/register', {
        method: 'POST',
        body: data,
      });
    }
  };
}
