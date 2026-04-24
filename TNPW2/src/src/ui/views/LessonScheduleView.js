// Rozvrhové zobrazení lekcí – týdenní mřížka.
// Dny = řádky vlevo, hodiny = sloupce nahoře.
// Blok lekce je absolutně pozicován uvnitř timeline řádku.
// Kritické rozměry jsou nastaveny přes inline styl (layout funguje bez CSS).

const DAYS_CZ = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
const HOUR_START = 6;
const HOUR_END   = 23;
const HOUR_COUNT = HOUR_END - HOUR_START + 1; // 18

const HOUR_W  = 100; // px na hodinu
const DAY_W   = 80;  // px pro popisek dne
const ROW_H   = 72;  // px výška řádku dne
const HEAD_H  = 32;  // px výška záhlaví hodin

const TOTAL_W = DAY_W + HOUR_COUNT * HOUR_W; // 1880 px

const TRAINER_COLORS = [
  '#1a7fc1', '#2a9d3e', '#e07b00', '#8e44ad',
  '#c0392b', '#16a085', '#d35400', '#2980b9',
];

function trainerColor(employeeId) {
  return TRAINER_COLORS[(employeeId ?? 0) % TRAINER_COLORS.length];
}

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function el(tag, styles = {}, attrs = {}) {
  const node = document.createElement(tag);
  Object.assign(node.style, styles);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'className') node.className = v;
    else if (k === 'title') node.title = v;
    else node.setAttribute(k, v);
  });
  return node;
}

function txt(str) { return document.createTextNode(str); }

export function LessonScheduleView({ lekce, lessonCapabilities, lessonHandlers, weekOffset, onPrevWeek, onNextWeek }) {
  const monday = getMonday(new Date());
  monday.setDate(monday.getDate() + (weekOffset ?? 0) * 7);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });

  // ---- Wrapper -------------------------------------------------------
  const wrapper = el('div', { width: '100%' }, { className: 'schedule-wrapper' });

  // ---- Navigace -------------------------------------------------------
  const nav = el('div', { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' });
  const btnPrev = el('button', {}, { className: 'button button--secondary btn-sm' });
  btnPrev.appendChild(txt('← Předchozí týden'));
  btnPrev.addEventListener('click', () => onPrevWeek?.());

  const btnNext = el('button', {}, { className: 'button button--secondary btn-sm' });
  btnNext.appendChild(txt('Příští týden →'));
  btnNext.addEventListener('click', () => onNextWeek?.());

  const fmt = { day: 'numeric', month: 'numeric' };
  const weekLabel = el('strong', { color: '#ddd', fontSize: '1rem', margin: '0 8px' });
  weekLabel.appendChild(txt(
    `${weekDays[0].toLocaleDateString('cs-CZ', fmt)} – ${weekDays[6].toLocaleDateString('cs-CZ', { ...fmt, year: 'numeric' })}`
  ));

  nav.appendChild(btnPrev);
  nav.appendChild(weekLabel);
  nav.appendChild(btnNext);
  wrapper.appendChild(nav);

  // ---- Scroll container -----------------------------------------------
  const scroll = el('div', { overflowX: 'auto', width: '100%' });

  // Vnitřní tabulka (pevná šíka = DAY_W + HOUR_COUNT * HOUR_W)
  const table = el('div', { width: TOTAL_W + 'px' });

  // ---- Záhlaví hodin --------------------------------------------------
  const headerRow = el('div', {
    display: 'flex',
    height: HEAD_H + 'px',
    borderBottom: '1px solid #333',
  });

  // Rohový prázdný blok
  const corner = el('div', {
    width: DAY_W + 'px',
    minWidth: DAY_W + 'px',
    flexShrink: '0',
    borderRight: '1px solid #333',
  });
  headerRow.appendChild(corner);

  for (let h = HOUR_START; h <= HOUR_END; h++) {
    const hCell = el('div', {
      width: HOUR_W + 'px',
      minWidth: HOUR_W + 'px',
      flexShrink: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRight: '1px solid #222',
      fontSize: '0.72rem',
      color: '#888',
    });
    hCell.appendChild(txt(`${String(h).padStart(2, '0')}:00`));
    headerRow.appendChild(hCell);
  }
  table.appendChild(headerRow);

  // ---- Řádky dní -------------------------------------------------------
  weekDays.forEach((dayDate, dayIdx) => {
    const dayRow = el('div', {
      display: 'flex',
      height: ROW_H + 'px',
      borderBottom: '1px solid #2a2a2a',
    });

    // Popisek dne vlevo
    const dayLabel = el('div', {
      width: DAY_W + 'px',
      minWidth: DAY_W + 'px',
      flexShrink: '0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderRight: '1px solid #333',
      color: '#aaa',
      fontSize: '0.82rem',
      gap: '2px',
    });
    const dayName = el('strong', { color: '#ccc' });
    dayName.appendChild(txt(DAYS_CZ[dayIdx]));
    const dayDateSpan = el('span', { color: '#666', fontSize: '0.7rem' });
    dayDateSpan.appendChild(txt(`${dayDate.getDate()}.${dayDate.getMonth() + 1}.`));
    dayLabel.appendChild(dayName);
    dayLabel.appendChild(dayDateSpan);
    dayRow.appendChild(dayLabel);

    // Timeline (pevná šířka v px, relativní pozicování bloků)
    const timeline = el('div', {
      width: (HOUR_COUNT * HOUR_W) + 'px',
      minWidth: (HOUR_COUNT * HOUR_W) + 'px',
      flexShrink: '0',
      position: 'relative',
      overflow: 'hidden',
    });

    // Svislé čáry hodin (mřížka pozadí)
    for (let h = 0; h < HOUR_COUNT; h++) {
      const line = el('div', {
        position: 'absolute',
        top: '0',
        bottom: '0',
        left: (h * HOUR_W) + 'px',
        width: '1px',
        backgroundColor: '#222',
      });
      timeline.appendChild(line);
    }

    // Lekce tohoto dne
    lekce.forEach((l, idx) => {
      if (!l.start_time) return;
      const start = new Date(l.start_time);
      if (start.toDateString() !== dayDate.toDateString()) return;

      const startHour = start.getHours() + start.getMinutes() / 60;
      if (startHour < HOUR_START || startHour >= HOUR_END) return;

      const durationHours = Math.max((l.duration ?? 60) / 60, 0.25);
      const leftPx  = Math.round((startHour - HOUR_START) * HOUR_W);
      const widthPx = Math.min(Math.round(durationHours * HOUR_W), HOUR_COUNT * HOUR_W - leftPx);

      const lh = lessonHandlers[idx] ?? {};
      const lessonId = l.lesson_schedule_id ?? l.lesson_id;
      const color = trainerColor(l.employee_id);

      const block = el('div', {
        position: 'absolute',
        top: '4px',
        bottom: '4px',
        left: leftPx + 'px',
        width: widthPx + 'px',
        backgroundColor: color,
        borderLeft: '3px solid ' + color,
        borderRadius: '4px',
        padding: '3px 5px',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        filter: 'brightness(0.85)',
      }, {
        title: `${l.name} | ${l.trainer_name ?? ''} | ${start.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}`,
        className: 'schedule-lesson-block',
      });

      block.addEventListener('mouseenter', () => { block.style.filter = 'brightness(1)'; });
      block.addEventListener('mouseleave', () => { block.style.filter = 'brightness(0.85)'; });

      // Název lekce
      const nameEl = el('div', {
        fontWeight: '700',
        fontSize: '0.75rem',
        color: '#fff',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }, { className: 'schedule-block-name' });
      nameEl.appendChild(txt(l.name ?? 'Lekce'));
      block.appendChild(nameEl);

      // Čas
      const timeEl = el('div', {
        fontSize: '0.68rem',
        color: 'rgba(255,255,255,0.8)',
        whiteSpace: 'nowrap',
      });
      timeEl.appendChild(txt(start.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })));
      block.appendChild(timeEl);

      // Trenér + kapacita
      const meta = el('div', {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.65rem',
        color: 'rgba(255,255,255,0.75)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }, { className: 'schedule-block-meta' });

      if (l.trainer_name) {
        const trainerEl = el('span', { overflow: 'hidden', textOverflow: 'ellipsis' });
        trainerEl.appendChild(txt(l.trainer_name));
        meta.appendChild(trainerEl);
      }
      const capEl = el('span', { fontWeight: '600', marginLeft: '4px', flexShrink: '0' });
      capEl.appendChild(txt(`${l.registered_count ?? 0}/${l.maximum_capacity ?? '?'}`));
      meta.appendChild(capEl);
      block.appendChild(meta);

      block.addEventListener('click', () => lh.onDetail?.(lessonId));
      timeline.appendChild(block);
    });

    dayRow.appendChild(timeline);
    table.appendChild(dayRow);
  });

  scroll.appendChild(table);
  wrapper.appendChild(scroll);
  return wrapper;
}
