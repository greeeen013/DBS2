// Mapování stavů na vizuální třídy:
//   DRAFT       → card--draft       (šedá, neutrální)
//   OPEN        → card--open        (zelená, dostupné)
//   FULL        → card--full        (oranžová, plná kapacita)
//   IN_PROGRESS → card--in-progress (modrá, probíhá)
//   COMPLETED   → card--completed   (fialová, skončená)
//   CANCELLED   → card--cancelled   (červená, stornována)

import { createElement } from '../createElement.js';

/**
 * @param {string} status - Stav lekce z databáze
 * @param {boolean} isFull - Přepíše na FULL vizuál i pro stav OPEN
 * @returns {string} CSS třída karty
 */
export function getLessonStatusClass(status, isFull = false) {
  if (isFull && status === 'OPEN') return 'card--full';

  switch (status) {
    case 'DRAFT': return 'card--draft';
    case 'OPEN': return 'card--open';
    case 'FULL': return 'card--full';
    case 'IN_PROGRESS': return 'card--in-progress';
    case 'COMPLETED': return 'card--completed';
    case 'CANCELLED': return 'card--cancelled';
    default: return 'card--draft';
  }
}

export function getLessonStatusLabel(status, isFull = false) {
  if (isFull && status === 'OPEN') return 'PLNÁ';

  switch (status) {
    case 'DRAFT': return 'Připravuje se';
    case 'OPEN': return 'Otevřená';
    case 'FULL': return 'Plná kapacita';
    case 'IN_PROGRESS': return 'Probíhá';
    case 'COMPLETED': return 'Dokončená';
    case 'CANCELLED': return 'Stornována';
    default: return status;
  }
}

/**
 * @param {{ lesson, lessonId, caps, lh }} options
 *   lesson    – data lekce ze stavu aplikace
 *   lessonId  – ID lekce (lesson_schedule_id nebo lesson_id)
 *   caps      – capability objekt z IR05 selektoru (isFull, ...)
 *   lh        – handler objekt z IR06 handler factory
 * @returns {HTMLElement} Sestavený DOM uzel karty
 */
export function createLessonCard({ lesson, lessonId, caps = {}, lh = {} }) {
  const statusClass = getLessonStatusClass(lesson.status, caps.isFull);
  const statusLabel = getLessonStatusLabel(lesson.status, caps.isFull);

  // Wrapper karta – barva/stínování je určeno CSS třídou dle stavu
  const karta = document.createElement('div');
  karta.className = `card lesson-card ${statusClass} mb-10 p-15`;
  karta.setAttribute('data-status', lesson.status);
  karta.setAttribute('data-lesson-id', lessonId);

  // --- Záhlaví karty: název + status badge ---
  const header = document.createElement('div');
  header.className = 'lesson-card__header';

  const nadpis = document.createElement('h3');
  nadpis.className = 'lesson-card__title';
  nadpis.appendChild(document.createTextNode(
    lesson.name ? `${lesson.name} (#${lessonId})` : `Lekce #${lessonId}`
  ));
  header.appendChild(nadpis);

  const stavBadge = document.createElement('span');
  stavBadge.className = `lesson-card__badge badge--${statusClass.replace('card--', '')}`;
  stavBadge.setAttribute('aria-label', `Stav lekce: ${statusLabel}`);
  stavBadge.appendChild(document.createTextNode(statusLabel));
  header.appendChild(stavBadge);

  karta.appendChild(header);

  // --- Informace o obsazenosti ---
  const obsazenost = document.createElement('p');
  obsazenost.className = 'lesson-card__capacity';
  const filled = lesson.registered_members ?? 0;
  const max = lesson.maximal_capacity ?? '?';
  obsazenost.appendChild(document.createTextNode(`Obsazenost: ${filled} / ${max}`));
  karta.appendChild(obsazenost);

  // --- Čas lekce (pokud je k dispozici) ---
  if (lesson.start_time) {
    const casEl = document.createElement('p');
    casEl.className = 'lesson-card__time text-muted';
    const cas = new Date(lesson.start_time).toLocaleString('cs-CZ', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
    casEl.appendChild(document.createTextNode(`Začátek: ${cas}`));
    karta.appendChild(casEl);
  }

  // --- Oblast akčních tlačítek ---
  const akce = document.createElement('div');
  akce.className = 'lesson-card__actions';

  if (lh.onOpen) {
    akce.appendChild(_makeButton('Zveřejnit', 'button--primary', () => lh.onOpen(lessonId)));
  }
  if (lh.onCancel) {
    akce.appendChild(_makeButton('Zrušit lekci', 'button--danger', () => lh.onCancel(lessonId)));
  }
  if (lh.onClose) {
    akce.appendChild(_makeButton('Uzavřít lekci', 'button--warning', () => lh.onClose(lessonId)));
  }
  if (lh.onSetAttendance) {
    akce.appendChild(_makeButton('Nastavit docházku', 'button--secondary', () => lh.onSetAttendance(lessonId)));
  }

  karta.appendChild(akce);
  return karta;
}

function _makeButton(label, cssClass, onClick) {
  const btn = document.createElement('button');
  btn.className = `button ${cssClass} me-5`;
  btn.appendChild(document.createTextNode(label));
  btn.addEventListener('click', onClick);
  return btn;
}
