// Dispatcher pro MMA aplikaci.
//
// Struktura je totožná se vzorem z prepare/dispatch.js – switch na type akce.
// Každá akce dostává objekt { store, api, payload } nebo podmnožinu.

import { appInit } from './appInit.js';
import { confirmReservation } from './actions/confirmReservation.js';
import { cancelReservation } from './actions/cancelReservation.js';
import { createPayment } from './actions/createPayment.js';
import * as CONST from '../constants.js';
import * as STATUS from '../statuses.js';

export function createDispatcher(store, api) {
  return async function dispatch(action) {
    const { type, payload = {} } = action ?? {};

    switch (type) {
      case 'APP_INIT':
        return appInit({ store, api });

      case CONST.ENTER_RESERVATION_LIST:
        return store.setState((state) => ({
          ...state,
          ui: { ...state.ui, mode: CONST.RESERVATION_LIST, status: STATUS.RDY },
        }));

      case CONST.ENTER_PAYMENT_VIEW:
        return store.setState((state) => ({
          ...state,
          ui: { ...state.ui, mode: CONST.PAYMENT_VIEW, status: STATUS.RDY },
        }));

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
            mode: CONST.RESERVATION_LIST,
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
