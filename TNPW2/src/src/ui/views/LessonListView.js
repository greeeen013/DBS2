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
import { addButton, addActionButton } from '../builder/components/button.js';

export function LessonListView({ viewState, handlers }) {
  const { lekce, lessonCapabilities = [] } = viewState;
  const {
    onGoToReservations,
    onCreateLesson,
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

  // Seznam lekcí
  if (!lekce || lekce.length === 0) {
    container.appendChild(createText(['Žádné lekce.'], 'text-muted'));
    return container;
  }

  const karty = createSection('cards');

  lekce.forEach((l, idx) => {
    // Capabilities pro tuto konkrétní lekci jsou předpočítány selektorem
    const caps = lessonCapabilities[idx] ?? {};
    // Handlery pro tuto konkrétní lekci (sestaveny dle caps)
    const lh = lessonHandlers[idx] ?? {};
    const lessonId = l.lesson_schedule_id ?? l.lesson_id;

    const karta = createDiv('card mb-10 p-15', [
      createTitle(3, `Lekce #${lessonId}`),
      createText(
        [`Stav: ${l.status}${caps.isFull ? ' (PLNÁ)' : ''}`],
        l.status === 'OPEN' ? 'text-success' : '',
      ),
      createText([`Obsazenost: ${l.registered_members ?? 0} / ${l.maximal_capacity ?? '?'}`]),
    ]);

    // Zveřejnit lekci (DRAFT → OPEN)
    if (lh.onOpen) {
      karta.appendChild(
        addActionButton(
          () => lh.onOpen(lessonId),
          'Zveřejnit',
          'button--primary me-5',
        ),
      );
    }

    // Zrušit lekci (OPEN nebo FULL)
    if (lh.onCancel) {
      karta.appendChild(
        addActionButton(
          () => lh.onCancel(lessonId),
          'Zrušit lekci',
          'button--danger me-5',
        ),
      );
    }

    // Uzavřít lekci (OPEN, FULL nebo IN_PROGRESS)
    if (lh.onClose) {
      karta.appendChild(
        addActionButton(
          () => lh.onClose(lessonId),
          'Uzavřít lekci',
          'button--warning me-5',
        ),
      );
    }

    // Nastavit docházku (COMPLETED)
    if (lh.onSetAttendance) {
      karta.appendChild(
        addActionButton(
          () => lh.onSetAttendance(lessonId),
          'Nastavit docházku',
          'button--secondary',
        ),
      );
    }

    karty.appendChild(karta);
  });

  container.appendChild(karty);
  return container;
}
