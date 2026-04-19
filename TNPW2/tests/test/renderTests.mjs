// Unit testy pro IR06 – Renderovací logika (View composition).
//
// Testují, že:
//   • createHandlers() vrací správnou sadu handlerů dle viewState.type
//   • lessonListHandlers() sestaví per-lekce handlery dle capabilities
//   • onCreateLesson existuje jen pro trainer/admin (capabilities.canCreateLesson)
//   • onCreateLesson neexistuje pro member
//   • Per-lekce handlery: onOpen jen pro DRAFT + trainer
//   • Per-lekce handlery: onCancel jen pro OPEN/FULL + trainer
//   • Per-lekce handlery: onSetAttendance jen pro COMPLETED + trainer
//   • lessonCreationHandlers() vrací onSubmit + onCancel
//   • reservationListHandlers() sestaví per-rezervace handlery
//   • createHandlers() pro neznámý pohled vrátí prázdný objekt
//   • getLessonStatusClass() mapuje stavy na správné CSS třídy
//   • getLessonStatusLabel() vrací správná česká označení stavů
//
// Testy nepoužívají DOM – testují čistě handler factory funkce a čisté funkce.

import { createHandlers } from '../../src/src/app/actionHandlers/createHandlers.js';
import { lessonListHandlers } from '../../src/src/app/actionHandlers/lessonListHandlers.js';
import { lessonCreationHandlers } from '../../src/src/app/actionHandlers/lessonCreationHandlers.js';
import { reservationListHandlers } from '../../src/src/app/actionHandlers/reservationListHandlers.js';
import { getLessonStatusClass, getLessonStatusLabel } from '../../src/src/ui/builder/components/lessonCard.js';
import { assert } from '../support/assert.mjs';

// ---------------------------------------------------------------------------
// Pomocné factory funkce pro sestavení testovacích viewState objektů
// ---------------------------------------------------------------------------

function makeLessonListView({ canCreateLesson = false, lessons = [] } = {}) {
  return {
    type: 'LESSON_LIST',
    lekce: lessons,
    capabilities: { canCreateLesson, canGoToReservations: true },
    lessonCapabilities: lessons.map((l, idx) => ({
      lessonId: l.lesson_id ?? idx + 1,
      canOpen:         l.canOpen ?? false,
      canCancel:       l.canCancel ?? false,
      canClose:        l.canClose ?? false,
      canSetAttendance: l.canSetAttendance ?? false,
      isFull:          l.isFull ?? false,
    })),
  };
}

function makeLessonCreationView() {
  return { type: 'LESSON_CREATION_VIEW' };
}

function makeReservationListView({ reservations = [] } = {}) {
  return {
    type: 'RESERVATION_LIST',
    rezervace: reservations,
    capabilities: { canGoToPayments: true },
    reservationCapabilities: reservations.map((r) => ({
      reservationId: r.reservation_id,
      canConfirm:    r.canConfirm ?? false,
      canCancel:     r.canCancel ?? false,
    })),
  };
}

// ---------------------------------------------------------------------------
// Sledovací dispatch – zaznamenává volání pro ověření v testech
// ---------------------------------------------------------------------------
function makeTrackingDispatch() {
  const calls = [];
  const dispatch = (action) => calls.push(action);
  dispatch.calls = calls;
  return dispatch;
}

// ---------------------------------------------------------------------------
// IR06 testy
// ---------------------------------------------------------------------------

export function testIR06() {
  console.log('\n[IR06] Testy renderovací logiky (createHandlers):');

  // --- createHandlers: LESSON_LIST vrátí handlers objekt s onGoToReservations ---
  const lessonListVS = makeLessonListView({ canCreateLesson: true });
  const dispatch1 = makeTrackingDispatch();
  const h1 = createHandlers(dispatch1, lessonListVS);

  assert(typeof h1.onGoToReservations === 'function',
    'createHandlers LESSON_LIST: onGoToReservations je funkce');

  // --- onCreateLesson existuje pro canCreateLesson: true (trainer/admin) ---
  assert(typeof h1.onCreateLesson === 'function',
    'createHandlers LESSON_LIST: onCreateLesson existuje pro canCreateLesson=true');

  // --- onCreateLesson NEEXISTUJE pro canCreateLesson: false (member) ---
  const memberLessonListVS = makeLessonListView({ canCreateLesson: false });
  const h2 = createHandlers(makeTrackingDispatch(), memberLessonListVS);
  assert(h2.onCreateLesson === undefined,
    'createHandlers LESSON_LIST: onCreateLesson neexistuje pro canCreateLesson=false');

  // --- onGoToReservations skutečně vyvolá ENTER_RESERVATION_LIST dispatch ---
  const dispatchNav = makeTrackingDispatch();
  const hNav = createHandlers(dispatchNav, makeLessonListView());
  hNav.onGoToReservations();
  assert(dispatchNav.calls.length === 1 && dispatchNav.calls[0].type === 'ENTER_RESERVATION_LIST',
    'onGoToReservations: dispatch volán s ENTER_RESERVATION_LIST');

  // --- Per-lekce handler: onOpen jen pro canOpen=true ---
  const vsWithOpenableDraft = makeLessonListView({
    canCreateLesson: true,
    lessons: [{ lesson_id: 1, canOpen: true, canCancel: false, canClose: false, canSetAttendance: false }],
  });
  const hOpen = lessonListHandlers(makeTrackingDispatch(), vsWithOpenableDraft);
  assert(typeof hOpen.lessonHandlers[0].onOpen === 'function',
    'lessonListHandlers: onOpen existuje pokud canOpen=true');
  assert(hOpen.lessonHandlers[0].onCancel === undefined,
    'lessonListHandlers: onCancel neexistuje pokud canCancel=false');

  // --- Per-lekce handler: onCancel jen pro canCancel=true ---
  const vsWithCancellable = makeLessonListView({
    lessons: [{ lesson_id: 2, canOpen: false, canCancel: true, canClose: true, canSetAttendance: false }],
  });
  const hCancel = lessonListHandlers(makeTrackingDispatch(), vsWithCancellable);
  assert(typeof hCancel.lessonHandlers[0].onCancel === 'function',
    'lessonListHandlers: onCancel existuje pokud canCancel=true');
  assert(typeof hCancel.lessonHandlers[0].onClose === 'function',
    'lessonListHandlers: onClose existuje pokud canClose=true');
  assert(hCancel.lessonHandlers[0].onOpen === undefined,
    'lessonListHandlers: onOpen neexistuje pokud canOpen=false');

  // --- Per-lekce handler: onSetAttendance jen pro canSetAttendance=true ---
  const vsCompleted = makeLessonListView({
    lessons: [{ lesson_id: 3, canOpen: false, canCancel: false, canClose: false, canSetAttendance: true }],
  });
  const hAttend = lessonListHandlers(makeTrackingDispatch(), vsCompleted);
  assert(typeof hAttend.lessonHandlers[0].onSetAttendance === 'function',
    'lessonListHandlers: onSetAttendance existuje pokud canSetAttendance=true');

  // --- onOpen skutečně volá dispatch s OPEN_LESSON ---
  const dispatchOpen = makeTrackingDispatch();
  const hForOpen = lessonListHandlers(dispatchOpen, vsWithOpenableDraft);
  hForOpen.lessonHandlers[0].onOpen(1);
  assert(dispatchOpen.calls.length === 1 && dispatchOpen.calls[0].type === 'OPEN_LESSON',
    'onOpen: dispatch volán s OPEN_LESSON');
  assert(dispatchOpen.calls[0].payload?.lessonId === 1,
    'onOpen: payload.lessonId je správné');

  // --- lessonCreationHandlers: vrátí onSubmit + onCancel ---
  const dispatchCreation = makeTrackingDispatch();
  const hCreation = lessonCreationHandlers(dispatchCreation, makeLessonCreationView());
  assert(typeof hCreation.onSubmit === 'function',
    'lessonCreationHandlers: onSubmit je funkce');
  assert(typeof hCreation.onCancel === 'function',
    'lessonCreationHandlers: onCancel je funkce');

  // --- onSubmit volá CREATE_LESSON + ENTER_LESSON_LIST ---
  const dispatchSubmit = makeTrackingDispatch();
  const hSubmit = lessonCreationHandlers(dispatchSubmit, makeLessonCreationView());
  hSubmit.onSubmit({ name: 'Test', duration: 60 });
  assert(dispatchSubmit.calls.length === 2,
    'lessonCreationHandlers.onSubmit: volá dispatch 2x (CREATE_LESSON + ENTER_LESSON_LIST)');
  assert(dispatchSubmit.calls[0].type === 'CREATE_LESSON',
    'lessonCreationHandlers.onSubmit: první volání je CREATE_LESSON');
  assert(dispatchSubmit.calls[1].type === 'ENTER_LESSON_LIST',
    'lessonCreationHandlers.onSubmit: druhé volání je ENTER_LESSON_LIST');

  // --- onCancel volá ENTER_LESSON_LIST ---
  const dispatchCancel = makeTrackingDispatch();
  const hCancelCreate = lessonCreationHandlers(dispatchCancel, makeLessonCreationView());
  hCancelCreate.onCancel();
  assert(dispatchCancel.calls.length === 1 && dispatchCancel.calls[0].type === 'ENTER_LESSON_LIST',
    'lessonCreationHandlers.onCancel: dispatch volán s ENTER_LESSON_LIST');

  // --- createHandlers: LESSON_CREATION_VIEW → vrátí onSubmit ---
  const hViaFactory = createHandlers(makeTrackingDispatch(), makeLessonCreationView());
  assert(typeof hViaFactory.onSubmit === 'function',
    'createHandlers LESSON_CREATION_VIEW: vrátí onSubmit');

  // --- reservationListHandlers: onGoToPayments když canGoToPayments=true ---
  const resVS = makeReservationListView({
    reservations: [
      { reservation_id: 10, canConfirm: true, canCancel: false },
      { reservation_id: 11, canConfirm: false, canCancel: true },
    ],
  });
  const dispatchRes = makeTrackingDispatch();
  const hRes = reservationListHandlers(dispatchRes, resVS);
  assert(typeof hRes.onGoToPayments === 'function',
    'reservationListHandlers: onGoToPayments existuje');
  assert(typeof hRes.reservationHandlers[0].onConfirm === 'function',
    'reservationListHandlers: onConfirm existuje pro canConfirm=true');
  assert(hRes.reservationHandlers[0].onCancel === undefined,
    'reservationListHandlers: onCancel neexistuje pro canCancel=false');
  assert(hRes.reservationHandlers[1].onConfirm === undefined,
    'reservationListHandlers: onConfirm neexistuje pro canConfirm=false');
  assert(typeof hRes.reservationHandlers[1].onCancel === 'function',
    'reservationListHandlers: onCancel existuje pro canCancel=true');

  // --- createHandlers: neznámý pohled → prázdný objekt (bez chyby) ---
  const hUnknown = createHandlers(makeTrackingDispatch(), { type: 'SOME_OTHER_VIEW' });
  assert(typeof hUnknown === 'object' && hUnknown !== null,
    'createHandlers: neznámý pohled vrátí objekt (ne null/undefined)');
  assert(Object.keys(hUnknown).length === 0,
    'createHandlers: neznámý pohled vrátí prázdný objekt');

  // ---------------------------------------------------------------------------
  // Testy getLessonStatusClass – propis stavu do CSS tříd (stínování dlaždic)
  // ---------------------------------------------------------------------------

  assert(getLessonStatusClass('DRAFT')       === 'card--draft',
    'getLessonStatusClass: DRAFT → card--draft');
  assert(getLessonStatusClass('OPEN')        === 'card--open',
    'getLessonStatusClass: OPEN → card--open');
  assert(getLessonStatusClass('FULL')        === 'card--full',
    'getLessonStatusClass: FULL → card--full');
  assert(getLessonStatusClass('IN_PROGRESS') === 'card--in-progress',
    'getLessonStatusClass: IN_PROGRESS → card--in-progress');
  assert(getLessonStatusClass('COMPLETED')   === 'card--completed',
    'getLessonStatusClass: COMPLETED → card--completed');
  assert(getLessonStatusClass('CANCELLED')   === 'card--cancelled',
    'getLessonStatusClass: CANCELLED → card--cancelled');

  // Přeplněná lekce (OPEN + isFull=true) musí vypadat jako FULL
  assert(getLessonStatusClass('OPEN', true)  === 'card--full',
    'getLessonStatusClass: OPEN + isFull=true → card--full (přeplněna)');
  // isFull neovlivňuje jiné stavy
  assert(getLessonStatusClass('DRAFT', true) === 'card--draft',
    'getLessonStatusClass: isFull=true ignorován pro DRAFT');

  // Neznámý stav → fallback na draft
  assert(getLessonStatusClass('NEZNAMY')     === 'card--draft',
    'getLessonStatusClass: neznámý stav → fallback card--draft');

  // ---------------------------------------------------------------------------
  // Testy getLessonStatusLabel – čitelné popisky stavů v češtině
  // ---------------------------------------------------------------------------

  assert(getLessonStatusLabel('DRAFT')       === 'Připravuje se',
    'getLessonStatusLabel: DRAFT → Připravuje se');
  assert(getLessonStatusLabel('OPEN')        === 'Otevřená',
    'getLessonStatusLabel: OPEN → Otevřená');
  assert(getLessonStatusLabel('FULL')        === 'Plná kapacita',
    'getLessonStatusLabel: FULL → Plná kapacita');
  assert(getLessonStatusLabel('IN_PROGRESS') === 'Probíhá',
    'getLessonStatusLabel: IN_PROGRESS → Probíhá');
  assert(getLessonStatusLabel('COMPLETED')   === 'Dokončená',
    'getLessonStatusLabel: COMPLETED → Dokončená');
  assert(getLessonStatusLabel('CANCELLED')   === 'Stornována',
    'getLessonStatusLabel: CANCELLED → Stornována');
  assert(getLessonStatusLabel('OPEN', true)  === 'PLNÁ',
    'getLessonStatusLabel: OPEN + isFull=true → PLNÁ');

  console.log('[IR06] Všechny testy renderovací logiky prošly ✓');
}
