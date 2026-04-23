// Router pro MMA SPA (IR04).
//
// Mapuje URL pathname → typ akce dispatcheru.
//
// Dvě vstupní body:
//   1. pathnameToAction(pathname) – čistá funkce, testovatelná v Node.js bez DOM
//   2. initRouter(dispatch)       – registruje popstate listener (pouze browser)
//
// URL pushování (při kliknutí na tlačítka) se děje v dispatch.js u každé ENTER_* akce
// a v enterProfileView.js. Router je záměrně jednosměrný: URL → dispatch,
// aby nedošlo ke smyčce se zpětnými pushState voláními.

import * as CONST from '../constants.js';

/**
 * Přeloží URL pathname na typ akce.
 * Čistá funkce – žádné side efekty, žádný přístup k window.
 *
 * @param {string} pathname - Hodnota window.location.pathname
 * @returns {string} Typ akce pro dispatch()
 */
export function pathnameToAction(pathname) {
  switch (pathname) {
    case '/payments':
      return CONST.ENTER_PAYMENT_VIEW;
    case '/profile':
      return CONST.ENTER_PROFILE_VIEW;
    case '/admin':
      return CONST.ENTER_ADMIN_VIEW;
    case '/permits':
      return CONST.ENTER_PERMITS;
    case '/':
    case '/reservations':
    default:
      return CONST.ENTER_RESERVATION_LIST;
  }
}

/**
 * Inicializuje router – registruje popstate listener pro browser back/forward.
 * Volat jednou při startu aplikace po vytvoření dispatch.
 *
 * @param {Function} dispatch - Funkce dispatch z createDispatcher()
 */
export function initRouter(dispatch) {
  window.addEventListener('popstate', () => {
    dispatch({ type: pathnameToAction(window.location.pathname) });
  });
}
