// Konstanty pro typy akcí a názvů pohledů v MMA aplikaci.
// Vzor přejat ze prepare/constants.js – každá akce/pohled má svůj string identifikátor.

// --- Pohledy (mode v UI stavu) ---
export const RESERVATION_LIST = 'RESERVATION_LIST';
export const PAYMENT_VIEW     = 'PAYMENT_VIEW';
export const PROFILE_VIEW     = 'PROFILE_VIEW';
export const AUTH_VIEW        = 'AUTH_VIEW';
export const ADMIN_VIEW       = 'ADMIN_VIEW';

// --- Akce dispatcheru ---
export const ENTER_RESERVATION_LIST = 'ENTER_RESERVATION_LIST';
export const ENTER_PAYMENT_VIEW     = 'ENTER_PAYMENT_VIEW';
export const ENTER_PROFILE_VIEW     = 'ENTER_PROFILE_VIEW';
export const ENTER_ADMIN_VIEW       = 'ENTER_ADMIN_VIEW';
export const APPROVE_PAYMENT        = 'APPROVE_PAYMENT';
export const REJECT_PAYMENT         = 'REJECT_PAYMENT';
export const LOGIN                  = 'LOGIN';
export const REGISTER               = 'REGISTER';
export const LOGOUT                 = 'LOGOUT';
export const CONFIRM_RESERVATION    = 'CONFIRM_RESERVATION';
export const CANCEL_RESERVATION     = 'CANCEL_RESERVATION';
export const CREATE_PAYMENT         = 'CREATE_PAYMENT';
export const RECOVER_FROM_ERROR     = 'RECOVER_FROM_ERROR';
export const CLEAR_NOTIFICATION     = 'CLEAR_NOTIFICATION';

