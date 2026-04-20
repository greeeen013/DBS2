// Pohled pro vytvoření nové lekce.
//
// IR06: Pohled NEVOLÁ dispatch přímo.
// Dostane objekt `handlers` se dvěma handlery:
//   handlers.onSubmit(lessonData) → CREATE_LESSON + ENTER_LESSON_LIST
//   handlers.onCancel()           → ENTER_LESSON_LIST
//
// Pohled slouží jen jako hloupý formulář – sbírá data a předá je handleru.
// O routování akcí neví nic.

import { createSection } from '../builder/components/section.js';
import { createTitle } from '../builder/components/title.js';
import { createDiv } from '../builder/components/div.js';
import { addActionButton } from '../builder/components/button.js';
import { createElement } from '../builder/createElement.js';

export function LessonCreationView({ viewState, handlers }) {
  const { onSubmit, onCancel } = handlers;

  const container = createSection('container mt-15');
  container.appendChild(createTitle(1, 'Vytvoření nové lekce'));

  const formSection = createSection('card p-15');

  // Pomocná funkce pro vytvoření pole formuláře
  const buildField = (labelText, inputOptions, inputType = 'input') => {
    const fieldContainer = createDiv('mb-10', []);
    fieldContainer.appendChild(createElement('label', { className: 'd-block mb-5 font-weight-bold' }, [
      document.createTextNode(labelText)
    ]));

    let inputEl;
    if (inputType === 'textarea') {
      inputEl = createElement('textarea', { className: 'form-control w-100', ...inputOptions }, []);
    } else {
      inputEl = createElement('input', { className: 'form-control w-100', ...inputOptions }, []);
    }
    fieldContainer.appendChild(inputEl);

    return { container: fieldContainer, inputEl };
  };

  const nameField     = buildField('Název lekce *', { type: 'text', required: true });
  const startField    = buildField('Čas začátku *', { type: 'datetime-local', required: true });
  const durationField = buildField('Délka v minutách *', { type: 'number', min: '1', value: '60', required: true });
  const capacityField = buildField('Maximální kapacita *', { type: 'number', min: '1', value: '20', required: true });
  const employeeField = buildField('ID Trenéra *', { type: 'number', value: '1', required: true });
  const typeField     = buildField('ID Typu lekce *', { type: 'number', value: '1', required: true });
  const descField     = buildField('Popis lekce', { rows: 3 }, 'textarea');

  formSection.appendChild(nameField.container);
  formSection.appendChild(startField.container);
  formSection.appendChild(durationField.container);
  formSection.appendChild(capacityField.container);
  formSection.appendChild(employeeField.container);
  formSection.appendChild(typeField.container);
  formSection.appendChild(descField.container);

  const actionsRow = createDiv('mt-15', []);

  // IR06: Pohled sestaví data z formuláře a předá je handleru onSubmit.
  // Pohled neví, co onSubmit udělá (CREATE_LESSON + navigace – to ví jen handler).
  if (onSubmit) {
    const submitBtn = addActionButton(
      () => {
        const lessonData = {
          name:             nameField.inputEl.value,
          description:      descField.inputEl.value || null,
          duration:         parseInt(durationField.inputEl.value, 10),
          start_time:       startField.inputEl.value
                              ? new Date(startField.inputEl.value).toISOString()
                              : null,
          maximum_capacity: parseInt(capacityField.inputEl.value, 10),
          employee_id:      parseInt(employeeField.inputEl.value, 10),
          lesson_type_id:   parseInt(typeField.inputEl.value, 10),
          status:           'OPEN',
        };

        if (!lessonData.name || !lessonData.start_time || isNaN(lessonData.duration) || isNaN(lessonData.maximum_capacity)) {
          alert('Vyplňte prosím všechna povinná pole s hvězdičkou správně.');
          return;
        }

        onSubmit(lessonData);
      },
      'Vytvořit lekci',
      'button--primary me-5',
    );
    actionsRow.appendChild(submitBtn);
  }

  // IR06: onCancel handler – pohled neví, kam navigovat, jen zavolá handler
  if (onCancel) {
    const cancelBtn = addActionButton(
      onCancel,
      'Zrušit',
      'button--danger',
    );
    actionsRow.appendChild(cancelBtn);
  }

  formSection.appendChild(actionsRow);
  container.appendChild(formSection);

  return container;
}
