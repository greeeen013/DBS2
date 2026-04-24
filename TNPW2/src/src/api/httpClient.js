// Obalovací wrapper pro nativní fetch() API.
//
// Řeší opakující se kód, který by jinak byl v každé API funkci zvlášť:
//  - nastavení base URL (nemusím ji opakovat v každém volání)
//  - JSON serializace těla požadavku
//  - JSON parsing odpovědi
//  - rozlišení HTTP chyb (4xx, 5xx) od síťových chyb
//  - překlad chybových zpráv z backendu (FastAPI vrací { detail: "..." })
//
// Vzor pro použití:
//   const data = await apiFetch('/reservations/', { method: 'POST', body: { ... } });
//
// Při chybě apiFetch() vyhodí Error s textem z backendu – akce v store to zachytí
// a zobrazí uživateli srozumitelnou zprávu.

const BASE_URL = 'http://localhost:8000';

export async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  };

  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  // Pokud body není string, serializujeme ho jako JSON
  if (config.body && typeof config.body !== 'string') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    // FastAPI vrací chybové zprávy jako { detail: "..." }
    const errorData = await response.json().catch(() => ({}));
    const err = new Error(errorData.detail ?? `Chyba serveru: ${response.status}`);
    err.status = response.status;
    throw err;
  }

  // 204 No Content – žádné tělo k parsování (DELETE endpointy)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null;
  }

  return response.json();
}
