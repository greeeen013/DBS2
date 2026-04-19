// Pohled se seznamem lekcí (Student B: Scheduled_Lesson).
//
// IR05: Pohled NEROZHUJE, co zobrazit – čte capabilities z viewState.
// Capabilities jsou plně vypočítány v selectors.js (canOpen, canCancel, …).
//
// Akce a tlačítka se zobrazují podle:
//   lessonCapabilities[lessonIdx].canOpen      → Zveřejnit
//   lessonCapabilities[lessonIdx].canCancel    → Zrušit
//   lessonCapabilities[lessonIdx].canClose     → Uzavřít
//   lessonCapabilities[lessonIdx].canSetAttendance → Nastavit docházku
//   capabilities.canCreateLesson              → Vytvořit novou lekci

import { createSection } from '../builder/components/section.js';
import { createTitle } from '../builder/components/title.js';
import { createText } from '../builder/components/text.js';
import { createDiv } from '../builder/components/div.js';
import { addActionButton } from '../builder/components/button.js';
import * as CONST from '../../constants.js';

export function LessonListView({ viewState, dispatch }) {
  const { lekce, capabilities = {}, lessonCapabilities = [] } = viewState;

  const container = createSection('container mt-15');

  // Nadpis
  container.appendChild(createTitle(1, 'Pretorian MMA – Lekce'));

  // Ovládací tlačítka nahoře
  const headerActions = createDiv('header-actions mb-15', []);

  const btnZpet = addActionButton(
    () => dispatch({ type: CONST.ENTER_RESERVATION_LIST }),
    '← Zpět na rezervace',
    'button--success me-5',
  );
  headerActions.appendChild(btnZpet);

  // IR05: Tlačítko "Vytvořit" se zobrazí jen pokud selektor povolí (trainer/admin)
  if (capabilities.canCreateLesson) {
    const btnCreateLesson = addActionButton(
      () => dispatch({ type: CONST.ENTER_LESSON_CREATION }),
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
    // IR05: Capabilities pro tuto konkrétní lekci jsou předpočítány selektorem
    const caps = lessonCapabilities[idx] ?? {};
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
    if (caps.canOpen) {
      karta.appendChild(
        addActionButton(
          () => dispatch({ type: CONST.OPEN_LESSON, payload: { lessonId } }),
          'Zveřejnit',
          'button--primary me-5',
        ),
      );
    }

    // Zrušit lekci (OPEN nebo FULL)
    if (caps.canCancel) {
      karta.appendChild(
        addActionButton(
          () => dispatch({ type: CONST.CANCEL_LESSON, payload: { lessonId } }),
          'Zrušit lekci',
          'button--danger me-5',
        ),
      );
    }

    // Uzavřít lekci (OPEN, FULL nebo IN_PROGRESS)
    if (caps.canClose) {
      karta.appendChild(
        addActionButton(
          () => dispatch({ type: CONST.CLOSE_LESSON, payload: { lessonId } }),
          'Uzavřít lekci',
          'button--warning me-5',
        ),
      );
    }

    // Nastavit docházku (COMPLETED)
    if (caps.canSetAttendance) {
      karta.appendChild(
        addActionButton(
          () => dispatch({ type: CONST.SET_ATTENDANCE, payload: { lessonId } }),
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
