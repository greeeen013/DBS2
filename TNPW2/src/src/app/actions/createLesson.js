import * as STATUS from '../../statuses.js';
import * as CONST from '../../constants.js';

/**
 * Generuje seznam dat opakování na základě nastaveného opakování.
 * @param {Date} firstDate – datum první lekce
 * @param {Object} recurrence – nastavení opakování
 * @returns {Date[]} – seřazený seznam dat (včetně firstDate)
 */
function generateRecurrenceDates(firstDate, recurrence) {
  if (!recurrence || recurrence.type === 'none') return [firstDate];

  const dates = [];
  const until = recurrence.until ? new Date(recurrence.until) : null;
  if (!until) return [firstDate];

  until.setHours(23, 59, 59, 999);

  const cur = new Date(firstDate);
  const firstWeekMonday = getMonday(firstDate);

  while (cur <= until) {
    const dow = cur.getDay(); // 0=Ne, 1=Po, ...6=So
    // normalizovat na 0=Po ... 6=Ne
    const isoDay = dow === 0 ? 6 : dow - 1;
    const weekOffset = Math.floor((getMonday(cur) - firstWeekMonday) / (7 * 86400000));

    let include = false;
    if (recurrence.type === 'weekly') {
      include = (recurrence.days ?? []).includes(isoDay);
    } else if (recurrence.type === 'biweekly') {
      include = weekOffset % 2 === 0 && (recurrence.days ?? []).includes(isoDay);
    } else if (recurrence.type === 'workdays') {
      include = isoDay <= 4; // Po-Pá
    } else if (recurrence.type === 'ndays') {
      const diff = Math.round((cur - firstDate) / 86400000);
      include = diff % (recurrence.interval ?? 1) === 0;
    }

    if (include) {
      dates.push(new Date(cur));
    }
    cur.setDate(cur.getDate() + 1);
  }

  // zajistit že první datum je vždy zahrnuto
  if (dates.length === 0 || dates[0].toDateString() !== firstDate.toDateString()) {
    dates.unshift(firstDate);
  }

  return dates;
}

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function createLesson({ store, api, payload, dispatch }) {
  const { lessonData, recurrence } = payload;
  const dates = generateRecurrenceDates(new Date(lessonData.start_time), recurrence);

  store.setState((state) => ({
    ...state,
    ui: { ...state.ui, status: STATUS.LOAD, notification: null },
  }));

  try {
    const results = [];
    for (const date of dates) {
      // Zachová čas, změní jen datum
      const origTime = new Date(lessonData.start_time);
      date.setHours(origTime.getHours(), origTime.getMinutes(), 0, 0);
      const payload = {
        ...lessonData,
        start_time: date.toISOString(),
      };
      const result = await api.lessons.create(payload);
      results.push(result);
    }

    const count = results.length;
    const msg = count > 1
      ? `Vytvořeno ${count} lekcí (opakování).`
      : 'Lekce byla úspěšně vypsána.';

    // Nastavíme notifikaci a pak navigujeme na seznam (který znovu načte data)
    store.setState((state) => ({
      ...state,
      ui: { ...state.ui, notification: { type: STATUS.OK, message: msg } },
    }));
    if (dispatch) dispatch({ type: CONST.ENTER_LESSON_LIST });
  } catch (error) {
    console.error('[createLesson] chyba:', error);
    const msg = error.message ?? 'Vytvoření lekce selhalo.';
    store.setState((state) => ({
      ...state,
      ui: { ...state.ui, status: STATUS.RDY },
    }));
    alert(`Vytvoření lekce selhalo:\n${msg}`);
  }
}
