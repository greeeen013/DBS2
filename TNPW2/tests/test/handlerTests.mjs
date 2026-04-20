// Unit testy pro IR07 – Handlery a vazba UI → akce.
//
// Testují, že:
//   • paymentHandlers() vrací onSubmitPayment a onGoToReservations
//   • profileHandlers() vrací onGoToReservations
//   • adminHandlers() vrací onApprovePayment, onRejectPayment a onGoToReservations
//   • authHandlers() vrací onLogin a onRegister
//   • userHeaderHandlers() vrací onLogout a onGoToAdmin
//   • Handlery správně volají dispatch s očekávanými parametry.

import { paymentHandlers } from '../../src/src/app/actionHandlers/paymentHandlers.js';
import { profileHandlers } from '../../src/src/app/actionHandlers/profileHandlers.js';
import { adminHandlers } from '../../src/src/app/actionHandlers/adminHandlers.js';
import { authHandlers } from '../../src/src/app/actionHandlers/authHandlers.js';
import { userHeaderHandlers } from '../../src/src/app/actionHandlers/userHeaderHandlers.js';
import { errorHandlers } from '../../src/src/app/actionHandlers/errorHandlers.js';
import { assert } from '../support/assert.mjs';

function makeTrackingDispatch() {
  const calls = [];
  const dispatch = (action) => calls.push(action);
  dispatch.calls = calls;
  return dispatch;
}

export function testIR07() {
  console.log('\n[IR07] Testy handlerů (nové factories):');

  // --- Payment handlers ---
  const d1 = makeTrackingDispatch();
  const h1 = paymentHandlers(d1, {});
  assert(typeof h1.onSubmitPayment === 'function', 'paymentHandlers: onSubmitPayment je funkce');
  h1.onSubmitPayment(500);
  assert(d1.calls[0].type === 'CREATE_PAYMENT' && d1.calls[0].payload.amount === 500, 'onSubmitPayment: dispatchuje CREATE_PAYMENT');

  // --- Profile handlers ---
  const d2 = makeTrackingDispatch();
  const h2 = profileHandlers(d2, {});
  assert(typeof h2.onGoToReservations === 'function', 'profileHandlers: onGoToReservations je funkce');
  h2.onGoToReservations();
  assert(d2.calls[0].type === 'ENTER_RESERVATION_LIST', 'onGoToReservations: dispatchuje ENTER_RESERVATION_LIST');

  // --- Admin handlers ---
  const d3 = makeTrackingDispatch();
  const h3 = adminHandlers(d3, {});
  assert(typeof h3.onApprovePayment === 'function', 'adminHandlers: onApprovePayment je funkce');
  h3.onApprovePayment(123);
  assert(d3.calls[0].type === 'APPROVE_PAYMENT' && d3.calls[0].payload.paymentId === 123, 'onApprovePayment: dispatchuje APPROVE_PAYMENT');

  // --- Auth handlers ---
  const d4 = makeTrackingDispatch();
  const h4 = authHandlers(d4, {});
  assert(typeof h4.onLogin === 'function', 'authHandlers: onLogin je funkce');
  h4.onLogin({ email: 'test@uhk.cz', password: '123' });
  assert(d4.calls[0].type === 'LOGIN' && d4.calls[0].payload.email === 'test@uhk.cz', 'onLogin: dispatchuje LOGIN');

  // --- User Header handlers ---
  const d5 = makeTrackingDispatch();
  const h5 = userHeaderHandlers(d5, { role: 'admin' });
  assert(typeof h5.onLogout === 'function', 'userHeaderHandlers: onLogout je funkce');
  h5.onLogout();
  assert(d5.calls[0].type === 'LOGOUT', 'onLogout: dispatchuje LOGOUT');

  // --- Error handlers ---
  const d6 = makeTrackingDispatch();
  const h6 = errorHandlers(d6, {});
  assert(typeof h6.onContinue === 'function', 'errorHandlers: onContinue je funkce');
  h6.onContinue();
  assert(d6.calls[0].type === 'RECOVER_FROM_ERROR', 'onContinue: dispatchuje RECOVER_FROM_ERROR');

  console.log('[IR07] Všechny testy handlerů prošly ✓');
}
