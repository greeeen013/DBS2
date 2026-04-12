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
  const memberId = localStorage.getItem('memberId');
  const memberName = localStorage.getItem('memberName');
  const hasToken = !!localStorage.getItem('token');

  return {
    // Rezervace a platby přihlášeného člena
    reservations: [],
    payments: [],

    // Kreditový zůstatek – načítá se při inicializaci z API
    creditBalance: null,

    // IR04: Kombinovaná historie pro ProfileView (rezervace + platby)
    history: {
      reservations: [],
      payments: [],
    },

    // Admin: čekající platby ke schválení
    pendingPayments: [],

    // Přihlášený člen
    auth: {
      memberId: memberId ? parseInt(memberId, 10) : null,
      name: memberName || null,
    },

    // UI stav
    ui: {
      mode: hasToken ? CONST.RESERVATION_LIST : CONST.AUTH_VIEW,
      status: hasToken ? STATUS.LOAD : STATUS.RDY,
      errorMessage: null,
      notification: null,  // { type: 'SUCCESS'|'WARNING', message }
    },
  };
}
