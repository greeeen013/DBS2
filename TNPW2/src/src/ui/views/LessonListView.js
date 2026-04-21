// Akce a tlačítka se zobrazují podle:
//   handlers.lessonHandlers[idx].onOpen      → Zveřejnit
//   handlers.lessonHandlers[idx].onCancel    → Zrušit
//   handlers.lessonHandlers[idx].onClose     → Uzavřít
//   handlers.lessonHandlers[idx].onSetAttendance → Nastavit docházku
//   handlers.onCreateLesson                  → Vytvořit novou lekci
//   capabilities.isFull                      → (PLNÁ) badge

import { createSection } from '../builder/components/section.js';
import { createTitle } from '../builder/components/title.js';
import { createText } from '../builder/components/text.js';
import { createDiv } from '../builder/components/div.js';
import { addActionButton } from '../builder/components/button.js';
import { createLessonCard } from '../builder/components/lessonCard.js';

export function LessonListView({ viewState, handlers }) {
  const { lekce, lessonCapabilities = [], capabilities = {}, lessonFilter = 'ALL' } = viewState;
  const {
    onGoToReservations,
    onCreateLesson,
    onSetFilter,
    lessonHandlers = [],
  } = handlers;

  const container = createSection('container mt-15');

  // Nadpis
  container.appendChild(createTitle(1, 'Pretorian MMA – Lekce'));

  // Ovládací tlačítka nahoře
  const headerActions = createDiv('header-actions mb-15', []);

  // handler existuje → tlačítko se zobrazí, neexistuje → ne
  if (onGoToReservations) {
    const btnZpet = addActionButton(
      onGoToReservations,
      '← Zpět na rezervace',
      'button--success me-5',
    );
    headerActions.appendChild(btnZpet);
  }

  // onCreateLesson existuje jen pokud capabilities.canCreateLesson === true (trainer/admin)
  if (onCreateLesson) {
    const btnCreateLesson = addActionButton(
      onCreateLesson,
      'Vytvořit novou lekci',
      'button--primary',
    );
    headerActions.appendChild(btnCreateLesson);
  }

  container.appendChild(headerActions);

  // Filtrovací tlačítka
  const filterRow = createDiv('filter-row mb-10');
  const filters = [
    { key: 'ALL', label: 'Vše' },
    { key: 'OPEN', label: 'Otevřené' },
    ...(capabilities.canCreateLesson ? [{ key: 'MINE', label: 'Moje lekce' }] : []),
  ];
  filters.forEach(({ key, label }) => {
    const btn = addActionButton(
      () => onSetFilter?.(key),
      label,
      `button--secondary btn-sm me-5${lessonFilter === key ? ' active' : ''}`,
    );
    filterRow.appendChild(btn);
  });
  container.appendChild(filterRow);

  // Seznam lekcí
  if (!lekce || lekce.length === 0) {
    container.appendChild(createText(['Žádné lekce.'], 'text-muted'));
    return container;
  }

  const karty = createSection('cards');

  lekce.forEach((l, idx) => {
    const caps = lessonCapabilities[idx] ?? {};
    const lh = lessonHandlers[idx] ?? {};
    const lessonId = l.lesson_schedule_id ?? l.lesson_id;

    const karta = createLessonCard({ lesson: l, lessonId, caps, lh });
    karty.appendChild(karta);
  });

  container.appendChild(karty);
  return container;
}
