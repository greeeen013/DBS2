// Dispatcher pro MMA aplikaci.
//
// Struktura je totožná se vzorem z prepare/dispatch.js – switch na type akce.
// Každá akce dostává objekt { store, api, payload } nebo podmnožinu.

import { appInit } from './appInit.js';
import { confirmReservation } from './actions/confirmReservation.js';
import { cancelReservation } from './actions/cancelReservation.js';
import { createPayment } from './actions/createPayment.js';
import { enterProfileView } from './actions/enterProfileView.js';
import { loginAction, registerAction } from './actions/authActions.js';
import * as CONST from '../constants.js';
import * as STATUS from '../statuses.js';

export function createDispatcher(store, api) {
  return async function dispatch(action) {
    const { type, payload = {} } = action ?? {};

    switch (type) {
      case 'APP_INIT':
        return appInit({ store, api });

      case CONST.LOGIN:
        return loginAction({ store, api, payload, dispatch });
      
      case CONST.REGISTER:
        return registerAction({ store, api, payload, dispatch });

      case CONST.LOGOUT:
        localStorage.removeItem('token');
        localStorage.removeItem('memberId');
        localStorage.removeItem('memberName');
        localStorage.removeItem('memberSurname');
        localStorage.removeItem('memberRole');
        if (typeof history !== 'undefined') history.pushState({}, '', '/');
        return store.setState((state) => ({
          ...state,
          auth: { memberId: null, name: null, surname: null, role: null },
          ui: { ...state.ui, mode: CONST.AUTH_VIEW, status: STATUS.RDY },
        }));

      case CONST.ENTER_RESERVATION_LIST:
        if (typeof history !== 'undefined') history.pushState({}, '', '/reservations');
        return store.setState((state) => ({
          ...state,
          ui: { ...state.ui, mode: CONST.RESERVATION_LIST, status: STATUS.RDY },
        }));

      case CONST.ENTER_PAYMENT_VIEW:
        if (typeof history !== 'undefined') history.pushState({}, '', '/payments');
        return store.setState((state) => ({
          ...state,
          ui: { ...state.ui, mode: CONST.PAYMENT_VIEW, status: STATUS.RDY },
        }));

      case CONST.ENTER_PROFILE_VIEW:
        return enterProfileView({ store, api });

      case CONST.CONFIRM_RESERVATION:
        return confirmReservation({ store, api, payload });

      case CONST.CANCEL_RESERVATION:
        return cancelReservation({ store, api, payload });

      case CONST.CREATE_PAYMENT:
        return createPayment({ store, api, payload });

      case CONST.RECOVER_FROM_ERROR:
        return store.setState((state) => ({
          ...state,
          ui: {
            ...state.ui,
            status: STATUS.RDY,
            mode: state.auth.memberId ? CONST.RESERVATION_LIST : CONST.AUTH_VIEW,
            errorMessage: null,
          },
        }));

      case CONST.CLEAR_NOTIFICATION:
        return store.setState((state) => ({
          ...state,
          ui: { ...state.ui, notification: null },
        }));

      default:
        console.warn(`Neznámý typ akce: ${type}`);
    }
  };
}
