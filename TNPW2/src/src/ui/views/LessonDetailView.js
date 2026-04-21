import { createSection } from '../builder/components/section.js';
import { createTitle } from '../builder/components/title.js';
import { createDiv } from '../builder/components/div.js';
import { addActionButton } from '../builder/components/button.js';
import { createElement } from '../builder/createElement.js';
import { getLessonStatusLabel, getLessonStatusClass } from '../builder/components/lessonCard.js';

export function LessonDetailView({ viewState, handlers }) {
  const { lesson, canEnroll, canUnenroll, canReopen, canOpen, canCancel, canClose, canSetAttendance } = viewState;
  const { onBack, onEnroll, onUnenroll, onReopen, onOpen, onCancel, onClose, onSetAttendance } = handlers;

  const container = createSection('container mt-15');

  if (!lesson) {
    container.appendChild(createElement('p', { className: 'text-muted' }, [
      document.createTextNode('Lekce nenalezena.')
    ]));
    if (onBack) container.appendChild(addActionButton(onBack, '← Zpět', 'button--success'));
    return container;
  }

  const statusClass = getLessonStatusClass(lesson.status);
  const statusLabel = getLessonStatusLabel(lesson.status);

  container.appendChild(createTitle(1, lesson.name ?? 'Lekce'));

  const card = createSection(`card p-15 ${statusClass}`);

  const rows = [
    ['Stav',          statusLabel],
    ['Délka',         `${lesson.duration} minut`],
    ['Kapacita',      `${lesson.registered_count ?? 0} / ${lesson.maximum_capacity}`],
    ['Cena',          lesson.price != null ? `${lesson.price} Kč` : '—'],
    ['Začátek',       lesson.start_time
                        ? new Date(lesson.start_time).toLocaleString('cs-CZ', { dateStyle: 'long', timeStyle: 'short' })
                        : '—'],
    ['Trenér',        lesson.trainer_name ?? String(lesson.employee_id ?? '—')],
    ['Typ lekce',     lesson.lesson_type_name ?? '—'],
  ];

  rows.forEach(([label, value]) => {
    const row = createDiv('mb-5', []);
    row.appendChild(createElement('strong', {}, [document.createTextNode(`${label}: `)]));
    row.appendChild(document.createTextNode(value));
    card.appendChild(row);
  });

  if (lesson.description) {
    const descRow = createDiv('mt-10', []);
    descRow.appendChild(createElement('strong', {}, [document.createTextNode('Popis: ')]));
    descRow.appendChild(document.createTextNode(lesson.description));
    card.appendChild(descRow);
  }

  container.appendChild(card);

  const actionsRow = createDiv('mt-15', []);

  // Trenérské akce
  if (canOpen && onOpen) {
    actionsRow.appendChild(addActionButton(onOpen, 'Zveřejnit', 'button--primary me-5'));
  }
  if (canClose && onClose) {
    actionsRow.appendChild(addActionButton(onClose, 'Uzavřít lekci', 'button--warning me-5'));
  }
  if (canReopen && onReopen) {
    actionsRow.appendChild(addActionButton(onReopen, 'Znovu otevřít', 'button--primary me-5'));
  }
  if (canCancel && onCancel) {
    actionsRow.appendChild(addActionButton(onCancel, 'Zrušit lekci', 'button--danger me-5'));
  }
  if (canSetAttendance && onSetAttendance) {
    actionsRow.appendChild(addActionButton(onSetAttendance, 'Nastavit docházku', 'button--secondary me-5'));
  }

  // Členské akce
  if (canUnenroll && onUnenroll) {
    const enrolledNote = createElement('p', { className: 'text-success mb-5' }, [
      document.createTextNode('Jste přihlášeni na tuto lekci.')
    ]);
    actionsRow.appendChild(enrolledNote);
    actionsRow.appendChild(addActionButton(onUnenroll, 'Odhlásit se', 'button--danger me-5'));
  } else if (canEnroll && onEnroll) {
    actionsRow.appendChild(addActionButton(onEnroll, 'Přihlásit se', 'button--primary me-5'));
  }

  if (onBack) {
    actionsRow.appendChild(addActionButton(onBack, '← Zpět na seznam', 'button--success'));
  }

  container.appendChild(actionsRow);
  return container;
}
