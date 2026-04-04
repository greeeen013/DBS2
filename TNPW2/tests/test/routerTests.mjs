// Unit testy pro router (IR04).
//
// Testuje pathnameToAction() – čistou funkci bez side efektů a bez přístupu k window.
// initRouter() vyžaduje DOM (window.addEventListener), proto se netestuje zde.
//
// Spustit:  node tests/runAllTests.mjs  (z adresáře TNPW2/)

import { pathnameToAction } from '../../src/src/app/router.js';
import { assert } from '../support/assert.mjs';

export function testRouter() {
  console.log('\n[IR04] Testy routeru (pathnameToAction):');

  assert(
    pathnameToAction('/') === 'ENTER_RESERVATION_LIST',
    '/ mapuje na ENTER_RESERVATION_LIST',
  );

  assert(
    pathnameToAction('/reservations') === 'ENTER_RESERVATION_LIST',
    '/reservations mapuje na ENTER_RESERVATION_LIST',
  );

  assert(
    pathnameToAction('/payments') === 'ENTER_PAYMENT_VIEW',
    '/payments mapuje na ENTER_PAYMENT_VIEW',
  );

  assert(
    pathnameToAction('/profile') === 'ENTER_PROFILE_VIEW',
    '/profile mapuje na ENTER_PROFILE_VIEW',
  );

  assert(
    pathnameToAction('/unknown') === 'ENTER_RESERVATION_LIST',
    'Neznámá cesta mapuje na ENTER_RESERVATION_LIST (fallback)',
  );

  assert(
    pathnameToAction('') === 'ENTER_RESERVATION_LIST',
    'Prázdná cesta mapuje na ENTER_RESERVATION_LIST (fallback)',
  );
}
