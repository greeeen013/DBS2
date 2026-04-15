// Pohled se seznamem lekcí (Student B: Scheduled_Lesson).
//
// Zobrazuje karty lekcí s akcemi podle aktuálního stavu:
//   DRAFT      → Zveřejnit, Zrušit
//   OPEN       → Zrušit (zobrazuje obsazenost)
//   FULL       → Zrušit (plně obsazeno)
//   IN_PROGRESS / COMPLETED → Nastavit docházku

import { createSection } from '../builder/components/section.js';
import { createTitle } from '../builder/components/title.js';
import { createText } from '../builder/components/text.js';
import { createDiv } from '../builder/components/div.js';
import { addActionButton } from '../builder/components/button.js';
import * as CONST from '../../constants.js';

export function LessonListView({ viewState, dispatch }) {
  const { lekce } = viewState;

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

  const btnCreateLesson = addActionButton(
    () => dispatch({ type: CONST.ENTER_LESSON_CREATION }),
    'Vytvořit novou lekci',
    'button--primary',
  );
  headerActions.appendChild(btnCreateLesson);

  container.appendChild(headerActions);

  // Seznam lekcí
  if (!lekce || lekce.length === 0) {
    container.appendChild(createText(['Žádné lekce.'], 'text-muted'));
    return container;
  }

  const karty = createSection('cards');

  lekce.forEach((l) => {
    const karta = createDiv('card mb-10 p-15', [
      createTitle(3, `Lekce #${l.lesson_id}`),
      createText([`Stav: ${l.status}`], l.status === 'OPEN' ? 'text-success' : ''),
      createText([`Obsazenost: ${l.registered_members ?? 0} / ${l.maximal_capacity ?? '?'}`]),
    ]);

    // Akce podle stavu lekce
    if (l.status === 'DRAFT') {
      karta.appendChild(
        addActionButton(
          () => dispatch({ type: CONST.OPEN_LESSON, payload: { lessonId: l.lesson_id } }),
          'Zveřejnit',
          'button--primary me-5',
        ),
      );
      karta.appendChild(
        addActionButton(
          () => dispatch({ type: CONST.CANCEL_LESSON, payload: { lessonId: l.lesson_id } }),
          'Zrušit',
          'button--danger',
        ),
      );
    }

    if (l.status === 'OPEN' || l.status === 'FULL') {
      karta.appendChild(
        addActionButton(
          () => dispatch({ type: CONST.CANCEL_LESSON, payload: { lessonId: l.lesson_id } }),
          'Zrušit lekci',
          'button--danger',
        ),
      );
    }

    if (l.status === 'COMPLETED') {
      karta.appendChild(
        createText(['Lekce dokončena – docházka je k dispozici.'], 'text-muted'),
      );
    }

    karty.appendChild(karta);
  });

  container.appendChild(karty);
  return container;
}
