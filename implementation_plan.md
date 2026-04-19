# IR05 – Selektory (Výběr dat ze stavu)

## Goal

IR05 requires selectors to be the **single place where capabilities are derived** from state. Currently `selectors.js` just returns raw arrays with hardcoded `canXxx: true`. The goal is to make them properly compute capabilities based on **lesson status** and **user role**, exactly like the reference project does.

## What Needs to Change

### 1. Capability selectors for Lessons (new)
Pure functions that return `true/false` based on current state — **no UI, no state mutations**.

| Function | Logic |
|---|---|
| `canCreateLesson(state)` | Role is `'trainer'` or `'admin'` |
| `canOpenLesson(lekce, state)` | Role is trainer/admin AND lesson status is `'CREATED'` |
| `canCancelLesson(lekce, state)` | Role is trainer/admin AND status is `'OPEN'` or `'FULL'` |
| `canCloseLesson(lekce, state)` | Role is trainer/admin AND status is `'OPEN'`, `'FULL'`, or `'IN_PROGRESS'` |
| `canSetAttendance(lekce, state)` | Role is trainer/admin AND status is `'COMPLETED'` |
| `isLessonFull(lekce)` | `registered_members >= maximal_capacity` |

### 2. Collection filter selectors (new)
| Function | Logic |
|---|---|
| `selectOpenLessons(state)` | Filter lessons with status `'OPEN'` |
| `selectAvailableLessons(state)` | Filter lessons that are `'OPEN'` and not full |
| `selectLessonById(state, lessonId)` | Find a lesson by ID |

### 3. Enrich `selectLessonListView(state)` 
Currently returns just a bare `lekce` array. Should return:
```js
{
  type: CONST.LESSON_LIST,
  lekce,                        // all lessons
  capabilities: {
    canCreateLesson: canCreateLesson(state),  // show "Create" button for trainers
    canGoToReservations: true,
  },
  // per-lesson capabilities computed here, available to the view
  lessonCapabilities: lekce.map(l => ({
    lessonId: l.lesson_schedule_id,
    canOpen: canOpenLesson(l, state),
    canCancel: canCancelLesson(l, state),
    canClose: canCloseLesson(l, state),
    canSetAttendance: canSetAttendance(l, state),
    isFull: isLessonFull(l),
  }))
}
```

### 4. Update `stateTests.mjs` to check IR05 state shape
Add tests in `stateTests.mjs` or a new `selectorTests.mjs` that verify capability logic for all lesson states.

---

## Files to Modify

#### [MODIFY] selectors.js
`TNPW2/src/src/infra/store/selectors.js` — add all capability + filter selectors and enrich `selectLessonListView`

#### [MODIFY] LessonListView.js
`TNPW2/src/src/ui/views/LessonListView.js` — consume the new `lessonCapabilities` array to conditionally show action buttons

#### [NEW] selectorTests.mjs (optional but recommended)
`TNPW2/tests/test/selectorTests.mjs` — unit tests for all capability selectors

#### [MODIFY] runAllTests.mjs
Add the new selector test file to the test runner

---

## Verification Plan
- Run `node tests/runAllTests.mjs` — all 41 existing tests continue to pass
- New selector tests cover: trainer role → can create/open/cancel, member role → cannot, lesson status transitions respected
