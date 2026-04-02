// Počáteční stav MMA aplikace.
//
// Struktura vychází ze vzorového projektu prepare/ – zachovávám stejný tvar ui objektu,
// aby bylo render.js a selectors.js konzistentní s tím, co jsem se naučil.
//
// member_id=1 je dočasná hodnota pro demonstraci IR03 bez autentizace.
// V dalších iteracích bude nahrazen přihlašovacím formulářem.

import * as CONST from '../constants.js';
import * as STATUS from '../statuses.js';

export function createInitialState() {
  return {
    // Rezervace a platby přihlášeného člena
    reservations: [],
    payments: [],

    // Kreditový zůstatek – načítá se při inicializaci z API
    creditBalance: null,

    // Přihlášený člen – zatím bez autentizace, member_id=1 pro demo
    auth: {
      memberId: 1,
      name: 'Demo člen',
    },

    // UI stav – totožná struktura jako v prepare/ pro konzistenci
    ui: {
      mode: CONST.RESERVATION_LIST,
      status: STATUS.LOAD,
      errorMessage: null,
      notification: null,  // { type: 'SUCCESS'|'WARNING', message }
    },
  };
}
