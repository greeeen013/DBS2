// Unit testy pro IR05 – Selektory capabilities a filtrace lekcí.
//
// Testují, že:
//   • canCreateLesson() se řídí rolí (trainer/admin smí, member/GUEST nesmí)
//   • canOpenLesson() vyžaduje roli + status DRAFT
//   • canCancelLesson() vyžaduje roli + status OPEN nebo FULL
//   • canCloseLesson() vyžaduje roli + status OPEN, FULL nebo IN_PROGRESS
//   • canSetAttendance() vyžaduje roli + status COMPLETED
//   • isLessonFull() závisí pouze na obsazenosti lekce
//   • selectOpenLessons() filtruje správně
//   • selectAvailableLessons() vyloučí plné lekce
//   • selectLessonById() najde lekci
//   • selectLessonListView() vrací správný tvar včetně lessonCapabilities

import {
  canCreateLesson,
  canOpenLesson,
  canCancelLesson,
  canCloseLesson,
  canSetAttendance,
  isLessonFull,
  selectOpenLessons,
  selectAvailableLessons,
  selectLessonById,
  selectLessonListView,
} from '../../src/src/infra/store/selectors.js';
import { assert } from '../support/assert.mjs';

// ---------------------------------------------------------------------------
// Pomocné factory funkce pro sestavení testovacího stavu
// ---------------------------------------------------------------------------

function makeState({ role = 'member', lessons = [] } = {}) {
  return {
    auth: { role },
    lessons,
    ui: { mode: 'LESSON_LIST', status: 'RDY', errorMessage: null },
  };
}

function makeLesson(overrides = {}) {
  return {
    lesson_id: 1,
    status: 'DRAFT',
    registered_members: 0,
    maximal_capacity: 10,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// canCreateLesson
// ---------------------------------------------------------------------------

export function testSelectorIR05() {
  console.log('\n[IR05] Testy capability a filtračních selektorů:');

  // --- canCreateLesson ---
  assert(canCreateLesson(makeState({ role: 'trainer' })) === true,
    'canCreateLesson: trainer smí vytvořit lekci');
  assert(canCreateLesson(makeState({ role: 'admin' })) === true,
    'canCreateLesson: admin smí vytvořit lekci');
  assert(canCreateLesson(makeState({ role: 'member' })) === false,
    'canCreateLesson: member NESMÍ vytvořit lekci');
  assert(canCreateLesson(makeState({ role: 'GUEST' })) === false,
    'canCreateLesson: GUEST NESMÍ vytvořit lekci');
  assert(canCreateLesson(makeState({ role: null })) === false,
    'canCreateLesson: null role → false');

  // --- canOpenLesson ---
  const draftLesson = makeLesson({ status: 'DRAFT' });
  const openLesson  = makeLesson({ status: 'OPEN' });

  assert(canOpenLesson(draftLesson, makeState({ role: 'trainer' })) === true,
    'canOpenLesson: trainer + DRAFT → true');
  assert(canOpenLesson(draftLesson, makeState({ role: 'member' })) === false,
    'canOpenLesson: member + DRAFT → false');
  assert(canOpenLesson(openLesson, makeState({ role: 'trainer' })) === false,
    'canOpenLesson: trainer + OPEN → false (nelze zveřejnit znovu)');

  // --- canCancelLesson ---
  const fullLesson = makeLesson({ status: 'FULL' });

  assert(canCancelLesson(openLesson, makeState({ role: 'trainer' })) === true,
    'canCancelLesson: trainer + OPEN → true');
  assert(canCancelLesson(fullLesson, makeState({ role: 'admin' })) === true,
    'canCancelLesson: admin + FULL → true');
  assert(canCancelLesson(draftLesson, makeState({ role: 'trainer' })) === false,
    'canCancelLesson: trainer + DRAFT → false');
  assert(canCancelLesson(openLesson, makeState({ role: 'member' })) === false,
    'canCancelLesson: member + OPEN → false');

  // --- canCloseLesson ---
  const inProgressLesson = makeLesson({ status: 'IN_PROGRESS' });
  const completedLesson  = makeLesson({ status: 'COMPLETED' });

  assert(canCloseLesson(openLesson, makeState({ role: 'trainer' })) === true,
    'canCloseLesson: trainer + OPEN → true');
  assert(canCloseLesson(fullLesson, makeState({ role: 'trainer' })) === true,
    'canCloseLesson: trainer + FULL → true');
  assert(canCloseLesson(inProgressLesson, makeState({ role: 'trainer' })) === true,
    'canCloseLesson: trainer + IN_PROGRESS → true');
  assert(canCloseLesson(completedLesson, makeState({ role: 'trainer' })) === false,
    'canCloseLesson: trainer + COMPLETED → false (již uzavřeno)');
  assert(canCloseLesson(openLesson, makeState({ role: 'member' })) === false,
    'canCloseLesson: member + OPEN → false');

  // --- canSetAttendance ---
  assert(canSetAttendance(completedLesson, makeState({ role: 'trainer' })) === true,
    'canSetAttendance: trainer + COMPLETED → true');
  assert(canSetAttendance(openLesson, makeState({ role: 'trainer' })) === false,
    'canSetAttendance: trainer + OPEN → false');
  assert(canSetAttendance(completedLesson, makeState({ role: 'member' })) === false,
    'canSetAttendance: member + COMPLETED → false');

  // --- isLessonFull ---
  assert(isLessonFull(makeLesson({ registered_members: 10, maximal_capacity: 10 })) === true,
    'isLessonFull: plně obsazeno → true');
  assert(isLessonFull(makeLesson({ registered_members: 11, maximal_capacity: 10 })) === true,
    'isLessonFull: přeplněno → true');
  assert(isLessonFull(makeLesson({ registered_members: 9, maximal_capacity: 10 })) === false,
    'isLessonFull: volné místo → false');
  assert(isLessonFull(makeLesson({ registered_members: 0, maximal_capacity: undefined })) === false,
    'isLessonFull: neznámá kapacita → false (Infinity)');

  // --- selectOpenLessons ---
  const state = makeState({
    role: 'member',
    lessons: [
      makeLesson({ lesson_id: 1, status: 'DRAFT' }),
      makeLesson({ lesson_id: 2, status: 'OPEN' }),
      makeLesson({ lesson_id: 3, status: 'OPEN' }),
      makeLesson({ lesson_id: 4, status: 'FULL' }),
    ],
  });

  const openLessons = selectOpenLessons(state);
  assert(openLessons.length === 2, 'selectOpenLessons: vrátí jen OPEN lekce (2)');
  assert(openLessons.every((l) => l.status === 'OPEN'), 'selectOpenLessons: všechny mají status OPEN');

  // --- selectAvailableLessons ---
  const stateWithFull = makeState({
    role: 'member',
    lessons: [
      makeLesson({ lesson_id: 1, status: 'OPEN', registered_members: 10, maximal_capacity: 10 }),
      makeLesson({ lesson_id: 2, status: 'OPEN', registered_members: 5,  maximal_capacity: 10 }),
    ],
  });

  const available = selectAvailableLessons(stateWithFull);
  assert(available.length === 1, 'selectAvailableLessons: vyloučí plnou lekci → 1');
  assert(available[0].lesson_id === 2, 'selectAvailableLessons: vrátí správnou lekci');

  // --- selectLessonById ---
  const stateForById = makeState({
    lessons: [
      makeLesson({ lesson_id: 42, status: 'OPEN' }),
      makeLesson({ lesson_id: 99, status: 'DRAFT' }),
    ],
  });

  const found = selectLessonById(stateForById, 42);
  assert(found !== null, 'selectLessonById: najde existující lekci');
  assert(found.lesson_id === 42, 'selectLessonById: vrátí správnou lekci');
  assert(selectLessonById(stateForById, 999) === null, 'selectLessonById: null pro neexistující ID');

  // --- selectLessonListView – struktura ---
  const viewState = selectLessonListView(makeState({
    role: 'trainer',
    lessons: [makeLesson({ lesson_id: 1, status: 'DRAFT' })],
  }));

  assert(viewState.type === 'LESSON_LIST', 'selectLessonListView: type je LESSON_LIST');
  assert(Array.isArray(viewState.lekce), 'selectLessonListView: lekce je pole');
  assert(Array.isArray(viewState.lessonCapabilities), 'selectLessonListView: lessonCapabilities je pole');
  assert(viewState.lessonCapabilities.length === 1, 'selectLessonListView: lessonCapabilities má 1 záznam');
  assert(viewState.lessonCapabilities[0].canOpen === true,
    'selectLessonListView: trainer + DRAFT → canOpen true');
  assert(viewState.capabilities.canCreateLesson === true,
    'selectLessonListView: trainer → canCreateLesson true');

  // Členovi nesmí canCreateLesson
  const memberView = selectLessonListView(makeState({ role: 'member', lessons: [] }));
  assert(memberView.capabilities.canCreateLesson === false,
    'selectLessonListView: member → canCreateLesson false');

  console.log('[IR05] Všechny testy selektorů prošly ✓');
}
