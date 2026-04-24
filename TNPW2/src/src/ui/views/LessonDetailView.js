import { createSection } from '../builder/components/section.js';
import { createTitle } from '../builder/components/title.js';
import { createDiv } from '../builder/components/div.js';
import { addActionButton } from '../builder/components/button.js';
import { createElement } from '../builder/createElement.js';
import { getLessonStatusLabel, getLessonStatusClass } from '../builder/components/lessonCard.js';

export function LessonDetailView({ viewState, handlers }) {
  const { lesson, canEnroll, canUnenroll, canReopen, canOpen, canCancel, canClose, canSetAttendance, canSeeEnrollees, canKickMembers, enrollees = [] } = viewState;
  const { onBack, onEnroll, onUnenroll, onReopen, onOpen, onCancel, onClose, onSetAttendance, onKickMember } = handlers;

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
    ['Stav',      statusLabel],
    ['Délka',     `${lesson.duration} minut`],
    ['Kapacita',  `${lesson.registered_count ?? 0} / ${lesson.maximum_capacity}`],
    ...(lesson.price != null ? [['Cena', `${lesson.price} Kč`]] : []),
    ['Začátek',   lesson.start_time
                    ? new Date(lesson.start_time).toLocaleString('cs-CZ', { dateStyle: 'long', timeStyle: 'short' })
                    : '—'],
    ['Trenér',    lesson.trainer_name ?? String(lesson.employee_id ?? '—')],
    ['Typ lekce', lesson.lesson_type_name ?? '—'],
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

  // ---- Seznam přihlášených (trenér/admin) ------------------------------
  if (canSeeEnrollees) {
    const enrollSection = createSection('card p-15 mt-15');
    enrollSection.appendChild(createElement('h3', { className: 'lesson-card__title mb-10' }, [
      document.createTextNode(`Přihlášení členové (${enrollees.length})`),
    ]));

    if (enrollees.length === 0) {
      enrollSection.appendChild(createElement('p', { className: 'text-muted' }, [
        document.createTextNode('Zatím nikdo přihlášen.'),
      ]));
    } else {
      enrollees.forEach((e) => {
        const row = createDiv('enrollee-row', []);

        const nameEl = createElement('span', { className: 'enrollee-name' }, [
          document.createTextNode(`${e.member_name} ${e.member_surname}`),
        ]);
        const statusEl = createElement('span', { className: `enrollee-status text-muted` }, [
          document.createTextNode(e.status),
        ]);

        row.appendChild(nameEl);
        row.appendChild(statusEl);

        if (canKickMembers && onKickMember) {
          const kickBtn = addActionButton(
            () => {
              const fullName = `${e.member_name} ${e.member_surname}`;
              if (!window.confirm(`Opravdu vyhodit ${fullName} z lekce?`)) return;
              onKickMember(e.reservation_id, fullName);
            },
            'Vyhodit',
            'button--danger btn-sm',
          );
          row.appendChild(kickBtn);
        }

        enrollSection.appendChild(row);
      });
    }

    container.appendChild(enrollSection);
  }

  return container;
}
