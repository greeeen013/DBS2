import { updateLessonCapacity } from '../../src/src/app/actions/updateLessonCapacity.js';
import { closeLesson } from '../../src/src/app/actions/closeLesson.js';
import { setAttendance } from '../../src/src/app/actions/setAttendance.js';
import { createLesson } from '../../src/src/app/actions/createLesson.js';
import { cancelLesson } from '../../src/src/app/actions/cancelLesson.js';
import { openLesson } from '../../src/src/app/actions/openLesson.js';
import { createDispatcher } from '../../src/src/app/dispatch.js';
import { assert } from '../support/assert.mjs';

function createMockStore(initialState) {
    let state = initialState;
    return {
        getState: () => state,
        setState: (fn) => { state = fn(state); }
    };
}

export async function testIR02Actions() {
    console.log('\n[IR02] Testy pro Dispatcher:');

    // ===== Test UPDATE_CAPACITY =====
    const initialState = {
        lessons: [{ lesson_id: 1, registered_members: 5, maximal_capacity: 10, status: 'OPEN' }]
    };

    const store = createMockStore(initialState);

    await updateLessonCapacity({
        store,
        api: {},
        payload: { lessonId: 1, change: 1 }
    });

    let state = store.getState();
    let lesson = state.lessons[0];

    assert(lesson.registered_members === 6, 'UPDATE_CAPACITY: Kapacita se zvedla o 1');
    assert(lesson.status === 'OPEN', 'UPDATE_CAPACITY: Status zustava OPEN protoze to neni maximalni kapacita');

    await updateLessonCapacity({
        store,
        api: {},
        payload: { lessonId: 1, change: 4 }
    });

    state = store.getState();
    lesson = state.lessons[0];

    assert(lesson.registered_members === 10, 'UPDATE_CAPACITY: Kapacita je na maximu');
    assert(lesson.status === 'FULL', 'UPDATE_CAPACITY: Status se zmenil na FULL pokud je naplnena kapacita');

    // ===== Test CLOSE_LESSON =====
    const mockCloseLessonApi = {
        lessons: { updateStatus: async (id, status) => ({ lesson_id: id, registered_members: 10, maximal_capacity: 10, status }) }
    };
    await closeLesson({
        store,
        api: mockCloseLessonApi,
        payload: { lessonId: 1, newStatus: 'COMPLETED' }
    });

    state = store.getState();
    lesson = state.lessons[0];

    assert(lesson.status === 'COMPLETED', 'CLOSE_LESSON: Lekce byla uspesne ukoncena');

    // ===== Test SET_ATTENDANCE =====
    const attendStore = createMockStore({ attendances: [] });

    await setAttendance({
        store: attendStore,
        api: {},
        payload: { lessonId: 10, memberId: 42, attended: true }
    });

    state = attendStore.getState();
    assert(state.attendances.length === 1, 'SET_ATTENDANCE: Docházka byla pridana');
    assert(state.attendances[0].lessonId === 10, 'SET_ATTENDANCE: Správné lessonId');
    assert(state.attendances[0].memberId === 42, 'SET_ATTENDANCE: Správné memberId');
    assert(state.attendances[0].attended === true, 'SET_ATTENDANCE: attended je true');

    // Přepsání existujícího záznamu
    await setAttendance({
        store: attendStore,
        api: {},
        payload: { lessonId: 10, memberId: 42, attended: false }
    });

    state = attendStore.getState();
    assert(state.attendances.length === 1, 'SET_ATTENDANCE: Duplicitní záznam byl nahrazen');
    assert(state.attendances[0].attended === false, 'SET_ATTENDANCE: attended se zmenilo na false');

    // ===== Test CREATE_LESSON =====
    const createStore = createMockStore({
        lessons: [],
        ui: { status: 'READY', notification: null }
    });
    const mockCreatedLesson = { lesson_id: 99, name: 'Nová lekce', status: 'DRAFT' };
    const mockCreateApi = {
        lessons: { create: async () => mockCreatedLesson }
    };

    await createLesson({
        store: createStore,
        api: mockCreateApi,
        payload: { lessonData: { name: 'Nová lekce' } }
    });

    state = createStore.getState();
    assert(state.lessons.length === 1, 'CREATE_LESSON: Lekce byla pridana do pole');
    assert(state.lessons[0].lesson_id === 99, 'CREATE_LESSON: Správné lesson_id');
    assert(state.ui.notification?.type === 'SUCCESS', 'CREATE_LESSON: Notifikace úspěchu');

    // ===== Test CANCEL_LESSON =====
    const cancelStore = createMockStore({
        lessons: [{ lesson_id: 5, status: 'OPEN' }],
        ui: { status: 'READY', notification: null }
    });
    const cancelledLesson = { lesson_id: 5, status: 'CANCELLED' };
    const mockCancelApi = {
        lessons: { updateStatus: async () => cancelledLesson }
    };

    await cancelLesson({
        store: cancelStore,
        api: mockCancelApi,
        payload: { lessonId: 5 }
    });

    state = cancelStore.getState();
    assert(state.lessons[0].status === 'CANCELLED', 'CANCEL_LESSON: Status se zmenil na CANCELLED');
    assert(state.ui.notification?.type === 'SUCCESS', 'CANCEL_LESSON: Notifikace úspěchu');

    // ===== Test OPEN_LESSON =====
    const openStore = createMockStore({
        lessons: [{ lesson_id: 7, status: 'DRAFT' }],
        ui: { status: 'READY', notification: null }
    });
    const openedLesson = { lesson_id: 7, status: 'OPEN' };
    const mockOpenApi = {
        lessons: { updateStatus: async () => openedLesson }
    };

    await openLesson({
        store: openStore,
        api: mockOpenApi,
        payload: { lessonId: 7 }
    });

    state = openStore.getState();
    assert(state.lessons[0].status === 'OPEN', 'OPEN_LESSON: Status se zmenil na OPEN');
    assert(state.ui.notification?.type === 'SUCCESS', 'OPEN_LESSON: Notifikace úspěchu');
}

export async function testDispatcher() {
    console.log('\n[IR02] Testy createDispatcher:');

    // Ověříme, že dispatcher správně routuje akce
    let calledAction = null;
    const mockStore = createMockStore({
        auth: { memberId: 1, name: 'Test', surname: 'User', role: 'member' },
        ui: { status: 'READY', mode: 'RESERVATION_LIST', notification: null, errorMessage: null }
    });

    const dispatch = createDispatcher(mockStore, {});

    // ENTER_RESERVATION_LIST – inline akce
    await dispatch({ type: 'ENTER_RESERVATION_LIST' });
    let state = mockStore.getState();
    assert(state.ui.mode === 'RESERVATION_LIST', 'DISPATCHER: ENTER_RESERVATION_LIST nastaví mode');

    // ENTER_PAYMENT_VIEW – inline akce
    await dispatch({ type: 'ENTER_PAYMENT_VIEW' });
    state = mockStore.getState();
    assert(state.ui.mode === 'PAYMENT_VIEW', 'DISPATCHER: ENTER_PAYMENT_VIEW nastaví mode');

    // ENTER_LESSON_LIST – inline akce
    await dispatch({ type: 'ENTER_LESSON_LIST' });
    state = mockStore.getState();
    assert(state.ui.mode === 'LESSON_LIST', 'DISPATCHER: ENTER_LESSON_LIST nastaví mode');

    // RECOVER_FROM_ERROR – inline akce
    await dispatch({ type: 'RECOVER_FROM_ERROR' });
    state = mockStore.getState();
    assert(state.ui.status === 'READY', 'DISPATCHER: RECOVER_FROM_ERROR nastaví status READY');
    assert(state.ui.mode === 'RESERVATION_LIST', 'DISPATCHER: RECOVER_FROM_ERROR nastaví mode RESERVATION_LIST');
    assert(state.ui.errorMessage === null, 'DISPATCHER: RECOVER_FROM_ERROR vymaže errorMessage');

    // CLEAR_NOTIFICATION – inline akce
    mockStore.setState((s) => ({ ...s, ui: { ...s.ui, notification: { message: 'test' } } }));
    await dispatch({ type: 'CLEAR_NOTIFICATION' });
    state = mockStore.getState();
    assert(state.ui.notification === null, 'DISPATCHER: CLEAR_NOTIFICATION vymaže notifikaci');

    // Neznámý typ – nesmí hodit chybu
    let threw = false;
    try {
        await dispatch({ type: 'NONSENSE_ACTION' });
    } catch {
        threw = true;
    }
    assert(!threw, 'DISPATCHER: Neznámý typ akce nevyhodí výjimku');
}
