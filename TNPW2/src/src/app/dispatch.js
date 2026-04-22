// Dispatcher pro MMA aplikaci.
//
// Struktura je totožná se vzorem z prepare/dispatch.js – switch na type akce.
// Každá akce dostává objekt { store, api, payload } nebo podmnožinu.

import { appInit } from './appInit.js';
import { confirmReservation } from './actions/confirmReservation.js';
import { cancelReservation } from './actions/cancelReservation.js';
import { createPayment } from './actions/createPayment.js';
import { enterProfileView } from './actions/enterProfileView.js';
import { enterAdminView } from './actions/enterAdminView.js';
import { loginAction, registerAction } from './actions/authActions.js';
import { createLesson } from './actions/createLesson.js';
import { cancelLesson } from './actions/cancelLesson.js';
import { updateLessonCapacity } from './actions/updateLessonCapacity.js';
import { closeLesson } from './actions/closeLesson.js';
import { setAttendance } from './actions/setAttendance.js';
import { openLesson } from './actions/openLesson.js';
import { enterPermitsView } from './actions/enterPermitsView.js';
import { purchaseMembership } from './actions/purchaseMembership.js';
import { createTariff } from './actions/createTariff.js';
import { deleteTariff } from './actions/deleteTariff.js';

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

      case CONST.ENTER_ADMIN_VIEW:
        return enterAdminView({ store, api });

      case CONST.ENTER_LESSON_LIST:
        if (typeof history !== 'undefined') history.pushState({}, '', '/lessons'); // optional but nice
        return store.setState((state) => ({
          ...state,
          ui: { ...state.ui, mode: CONST.LESSON_LIST, status: STATUS.RDY },
        }));

      case CONST.ENTER_LESSON_CREATION:
        if (typeof history !== 'undefined') history.pushState({}, '', '/lessons/create'); // optional but nice
        return store.setState((state) => ({
          ...state,
          ui: { ...state.ui, mode: CONST.LESSON_CREATION_VIEW, status: STATUS.RDY },
        }));

      case CONST.APPROVE_PAYMENT: {
        const { paymentId } = payload;
        try {
          await api.admin.approvePayment(paymentId);
          // Obnovíme seznam čekajících plateb po schválení
          const updated = await api.admin.getPendingPayments();
          store.setState((state) => ({
            ...state,
            pendingPayments: updated,
            ui: {
              ...state.ui,
              notification: { type: STATUS.OK, message: 'Platba byla úspěšně schválena.' },
            },
          }));
        } catch (error) {
          store.setState((state) => ({
            ...state,
            ui: {
              ...state.ui,
              notification: { type: STATUS.ERR, message: error.message ?? 'Schválení platby selhalo.' },
            },
          }));
        }
        return;
      }

      case CONST.REJECT_PAYMENT: {
        const { paymentId } = payload;
        try {
          await api.admin.rejectPayment(paymentId);
          const updated = await api.admin.getPendingPayments();
          store.setState((state) => ({
            ...state,
            pendingPayments: updated,
            ui: {
              ...state.ui,
              notification: { type: STATUS.OK, message: 'Platba byla zamítnuta.' },
            },
          }));
        } catch (error) {
          store.setState((state) => ({
            ...state,
            ui: {
              ...state.ui,
              notification: { type: STATUS.ERR, message: error.message ?? 'Zamítnutí platby selhalo.' },
            },
          }));
        }
        return;
      }

      case CONST.CONFIRM_RESERVATION:
        return confirmReservation({ store, api, payload });

      case CONST.CANCEL_RESERVATION:
        return cancelReservation({ store, api, payload });

      case CONST.CREATE_PAYMENT:
        return createPayment({ store, api, payload });

      // --- Lekce (Student B IR02)
      case CONST.OPEN_LESSON:
        return openLesson({ store, api, payload });

      case CONST.CREATE_LESSON:
        return createLesson({ store, api, payload });

      case CONST.CANCEL_LESSON:
        return cancelLesson({ store, api, payload });

      case CONST.UPDATE_CAPACITY:
        return updateLessonCapacity({ store, api, payload });

      case CONST.CLOSE_LESSON:
        return closeLesson({ store, api, payload });

      case CONST.SET_ATTENDANCE:
        return setAttendance({ store, api, payload });

      case CONST.ENTER_PERMITS:
        return enterPermitsView({ store, api });

      case CONST.PURCHASE_MEMBERSHIP:
        return purchaseMembership({ store, api, payload });

      case CONST.CREATE_TARIFF:
        return createTariff({ store, api, payload });

      case CONST.DELETE_TARIFF:
        return deleteTariff({ store, api, payload });

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
