// Polyfilly pro prohlížečová API v Node.js.
//
// Node.js nemá window, localStorage, alert, confirm, history ani document.
// Testy ale importují moduly, které na ně odkazují (httpClient.js → localStorage,
// createLesson.js → alert, router.js → history apod.).
//
// Tento soubor je importován jako PRVNÍ v runAllTests.mjs – stačí ho importovat
// jednou a polyfilly platí pro celý běh testů.

if (typeof globalThis.alert === 'undefined') {
  globalThis.alert = () => {};
}
if (typeof globalThis.confirm === 'undefined') {
  globalThis.confirm = () => true;
}

if (typeof globalThis.localStorage === 'undefined') {
  const _data = {};
  globalThis.localStorage = {
    getItem: (k) => _data[k] ?? null,
    setItem: (k, v) => { _data[k] = String(v); },
    removeItem: (k) => { delete _data[k]; },
  };
}

if (typeof globalThis.window === 'undefined') {
  globalThis.window = { location: { pathname: '/' } };
}

if (typeof globalThis.history === 'undefined') {
  globalThis.history = { pushState: () => {}, replaceState: () => {} };
}
