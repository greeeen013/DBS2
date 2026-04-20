// Selektory pro MMA aplikaci.
//
// Selektory vypočítávají odvozené hodnoty ze stavu a capabilities pro UI.
// Vzor přejat z prepare/selectors.js – odděluje logiku "co zobrazit" od stavu.
//
// IR05: Všechny capabilities jsou počítány čistými funkcemi ze stavu –
// UI pouze čte výsledek, nerozhoduje samo o sobě, co zobrazit.

import * as CONST from '../../constants.js';
import * as STATUS from '../../statuses.js';

// --- Datové selektory ---

export function selectReservations(state) {
  return state.reservations ?? [];
}

export function selectPayments(state) {
  return state.payments ?? [];
}

export function selectLessons(state) {
  return state.lessons ?? [];
}

export function selectCreditBalance(state) {
  return state.creditBalance;
}

// --- Capability selektory – Rezervace ---

export function canConfirmReservation(rezervace) {
  return rezervace.status === 'CREATED';
}

export function canCancelReservation(rezervace) {
  return rezervace.status === 'CREATED' || rezervace.status === 'CONFIRMED';
}

export function hasCredits(state) {
  return (state.creditBalance ?? 0) > 0;
}

export function selectIsAdmin(state) {
  return state.auth.role === 'admin';
}

// --- IR05: Capability selektory – Lekce ---
// Čisté funkce: nemodifikují stav, neinteragují s DOM.
// Role 'trainer' nebo 'admin' = oprávněný lektor.

function isTrainerOrAdmin(state) {
  const role = state.auth?.role;
  return role === 'trainer' || role === 'admin';
}

/**
 * canCreateLesson – trenér/admin může vytvořit novou lekci.
 */
export function canCreateLesson(state) {
  return isTrainerOrAdmin(state);
}

/**
 * canOpenLesson – lekce se může zveřejnit pouze ze stavu DRAFT.
 * (V DB je stav uložen jako 'DRAFT'; UI/API ho nazývá 'CREATED'.)
 */
export function canOpenLesson(lekce, state) {
  return isTrainerOrAdmin(state) && lekce.status === 'DRAFT';
}

/**
 * canCancelLesson – trenér/admin může zrušit otevřenou nebo plnou lekci.
 */
export function canCancelLesson(lekce, state) {
  return isTrainerOrAdmin(state) &&
    (lekce.status === 'OPEN' || lekce.status === 'FULL');
}

/**
 * canCloseLesson – trenér/admin může ukončit lekci (přesun do IN_PROGRESS/COMPLETED).
 */
export function canCloseLesson(lekce, state) {
  return isTrainerOrAdmin(state) &&
    (lekce.status === 'OPEN' || lekce.status === 'FULL' || lekce.status === 'IN_PROGRESS');
}

/**
 * canSetAttendance – docházku lze nastavit jen na dokončené lekci.
 */
export function canSetAttendance(lekce, state) {
  return isTrainerOrAdmin(state) && lekce.status === 'COMPLETED';
}

/**
 * isLessonFull – lekce je plná, pokud počet registrovaných dosáhl kapacity.
 */
export function isLessonFull(lekce) {
  const registered = lekce.registered_members ?? 0;
  const capacity = lekce.maximal_capacity ?? Infinity;
  return registered >= capacity;
}

// --- IR05: Filtrační selektory – Lekce ---

/**
 * selectOpenLessons – vrátí jen lekce se stavem OPEN.
 */
export function selectOpenLessons(state) {
  return selectLessons(state).filter((l) => l.status === 'OPEN');
}

/**
 * selectAvailableLessons – lekce OPEN a zároveň s volnou kapacitou.
 */
export function selectAvailableLessons(state) {
  return selectOpenLessons(state).filter((l) => !isLessonFull(l));
}

/**
 * selectLessonById – najde lekci podle ID.
 */
export function selectLessonById(state, lessonId) {
  return selectLessons(state).find(
    (l) => (l.lesson_schedule_id ?? l.lesson_id) === lessonId,
  ) ?? null;
}

// --- View selektory ---

export function selectReservationListView(state) {
  const rezervace = selectReservations(state);
  const zustatek = selectCreditBalance(state);

  return {
    type: CONST.RESERVATION_LIST,
    rezervace,
    zustatek,
    capabilities: {
      canGoToPayments: true,
      canConfirm: true,
      canCancel: true,
    },
    reservationCapabilities: rezervace.map((r) => ({
      reservationId: r.reservation_id,
      canConfirm: canConfirmReservation(r),
      canCancel: canCancelReservation(r),
    })),
  };
}

export function selectPaymentView(state) {
  const platby = selectPayments(state);
  const zustatek = selectCreditBalance(state);

  return {
    type: CONST.PAYMENT_VIEW,
    platby,
    zustatek,
    capabilities: {
      canGoToReservations: true,
      canPay: true,
    },
  };
}

export function selectLessonListView(state) {
  const lekce = selectLessons(state);

  return {
    type: CONST.LESSON_LIST,
    lekce,
    capabilities: {
      // IR05: Globální capabilities závisí na roli, ne na konkrétní lekci
      canCreateLesson: canCreateLesson(state),
      canGoToReservations: true,
    },
    // IR05: Per-lekce capabilities – UI je čte, nerozhoduje samo
    lessonCapabilities: lekce.map((l) => ({
      lessonId: l.lesson_schedule_id ?? l.lesson_id,
      canOpen: canOpenLesson(l, state),
      canCancel: canCancelLesson(l, state),
      canClose: canCloseLesson(l, state),
      canSetAttendance: canSetAttendance(l, state),
      isFull: isLessonFull(l),
    })),
  };
}

export function selectProfileView(state) {
  return {
    type: CONST.PROFILE_VIEW,
    historyReservations: state.history?.reservations ?? [],
    historyPayments: state.history?.payments ?? [],
    capabilities: {
      canGoToReservations: true,
      canGoToPayments: true,
    },
  };
}

export function selectAuthView(state) {
  return {
    type: CONST.AUTH_VIEW,
  };
}

export function selectAdminView(state) {
  return {
    type: CONST.ADMIN_VIEW,
    pendingPayments: state.pendingPayments ?? [],
  };
}

/**
 * Hlavní selektor – vrací viewState na základě aktuálního UI módu.
 * Vzor totožný s prepare/selectors.js selectViewState().
 */
export function selectViewState(state) {
  // LOADING stav – zobrazí se spinner
  if (state.ui.status === STATUS.LOAD) {
    return { type: 'LOADING' };
  }

  // ERROR stav – zobrazí se chybová zpráva
  if (state.ui.status === STATUS.ERR) {
    return { type: 'ERROR', message: state.ui.errorMessage ?? 'Nastala chyba.' };
  }

  switch (state.ui.mode) {
    case CONST.RESERVATION_LIST:
      return selectReservationListView(state);
    case CONST.PAYMENT_VIEW:
      return selectPaymentView(state);
    case CONST.LESSON_LIST:
      return selectLessonListView(state);
    case CONST.LESSON_CREATION_VIEW:
      return { type: CONST.LESSON_CREATION_VIEW };
    case CONST.PROFILE_VIEW:
      return selectProfileView(state);
    case CONST.AUTH_VIEW:
      return selectAuthView(state);
    case CONST.ADMIN_VIEW:
      return selectAdminView(state);
    default:
      return { type: 'ERROR', message: 'Neznámý pohled aplikace.' };
  }
}
