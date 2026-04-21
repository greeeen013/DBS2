import { createSection } from '../builder/components/section.js';
import { createTitle } from '../builder/components/title.js';
import { createText } from '../builder/components/text.js';
import { createDiv } from '../builder/components/div.js';
import { addActionButton } from '../builder/components/button.js';
import { createElement } from '../builder/createElement.js';

export function LessonAttendanceView({ viewState, handlers }) {
  const { lessonName, attendees = [] } = viewState;
  const { onBack, onSave } = handlers;

  const container = createSection('container mt-15');
  container.appendChild(createTitle(1, `Docházka – ${lessonName ?? 'lekce'}`));

  if (onBack) {
    container.appendChild(addActionButton(onBack, '← Zpět na detail lekce', 'button--success mb-15'));
  }

  const active = attendees.filter((a) => a.status !== 'CANCELLED');

  if (active.length === 0) {
    container.appendChild(createText(['Žádní účastníci.'], 'text-muted'));
    return container;
  }

  const checkboxRefs = [];

  const table = createElement('table', { className: 'table table-bordered mt-10' });
  const thead = createElement('thead', { className: 'table-dark' });
  const headerRow = createElement('tr');
  ['Člen', 'Stav rezervace', 'Byl přítomen'].forEach((t) => headerRow.appendChild(createElement('th', {}, [t])));
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = createElement('tbody');
  active.forEach((a) => {
    const row = createElement('tr');

    const jmeno = [a.member_name, a.member_surname].filter(Boolean).join(' ') || `Člen #${a.member_id}`;
    row.appendChild(createElement('td', {}, [a.guest_name ? `${jmeno} (host: ${a.guest_name})` : jmeno]));

    const stavLabels = { CREATED: 'Čeká na potvrzení', CONFIRMED: 'Potvrzená', ATTENDED: 'Absolvována' };
    row.appendChild(createElement('td', {}, [stavLabels[a.status] ?? a.status]));

    const tdCheck = createElement('td');
    const checkbox = createElement('input', { type: 'checkbox', className: 'form-check-input' });
    if (a.attendance === true) checkbox.setAttribute('checked', 'checked');
    checkboxRefs.push({ memberId: a.member_id, checkbox });
    tdCheck.appendChild(checkbox);
    row.appendChild(tdCheck);
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  container.appendChild(table);

  if (onSave) {
    const saveBtn = addActionButton(
      () => {
        const members = checkboxRefs.map(({ memberId, checkbox }) => ({
          member_id: memberId,
          attended: checkbox.checked,
        }));
        onSave(members);
      },
      'Uložit docházku',
      'button--primary mt-15',
    );
    container.appendChild(saveBtn);
  }

  return container;
}
