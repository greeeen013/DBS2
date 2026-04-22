// Pohled pro vytvoření nové lekce.
//
// IR06: Pohled NEVOLÁ dispatch přímo.
// Dostane objekt `handlers` se dvěma handlery:
//   handlers.onSubmit(lessonData) → CREATE_LESSON + ENTER_LESSON_LIST
//   handlers.onCancel()           → ENTER_LESSON_LIST
//
// viewState obsahuje: trainers[], lessonTemplates[], auth { role, memberId, name, surname }

import { createSection } from '../builder/components/section.js';
import { createTitle } from '../builder/components/title.js';
import { createDiv } from '../builder/components/div.js';
import { addActionButton } from '../builder/components/button.js';
import { createElement } from '../builder/createElement.js';

export function LessonCreationView({ viewState, handlers }) {
  const { onSubmit, onCancel } = handlers;
  const { trainers = [], lessonTemplates = [], auth = {} } = viewState;
  const isAdmin = auth.role === 'admin';

  const container = createSection('container mt-15');
  container.appendChild(createTitle(1, 'Vytvoření nové lekce'));

  const formSection = createSection('card p-15');

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

  const buildSelect = (labelText) => {
    const fieldContainer = createDiv('mb-10', []);
    fieldContainer.appendChild(createElement('label', { className: 'd-block mb-5 font-weight-bold' }, [
      document.createTextNode(labelText)
    ]));
    const selectEl = createElement('select', { className: 'form-control w-100' }, []);
    fieldContainer.appendChild(selectEl);
    return { container: fieldContainer, selectEl };
  };

  // --- Template (nepovinné) ---
  const templateField = buildSelect('Šablona lekce (nepovinné)');
  const defaultOpt = createElement('option', { value: '' }, [document.createTextNode('— bez šablony —')]);
  templateField.selectEl.appendChild(defaultOpt);
  lessonTemplates.forEach((t) => {
    const opt = createElement('option', { value: String(t.lesson_template_id) }, [
      document.createTextNode(t.name)
    ]);
    templateField.selectEl.appendChild(opt);
  });

  // --- Pole formuláře ---
  const nameField     = buildField('Název lekce *', { type: 'text', required: true });
  const startField    = buildField('Čas začátku *', { type: 'datetime-local', required: true });
  const durationField = buildField('Délka v minutách *', { type: 'number', min: '1', value: '60', required: true });
  const capacityField = buildField('Maximální kapacita *', { type: 'number', min: '1', value: '20', required: true });
  const descField     = buildField('Popis lekce', { rows: 3 }, 'textarea');

  // lesson_type_id je interní hodnota – uživatel ji nevidí, přijde ze šablony nebo default 1
  let lessonTypeId = 1;

  // Auto-fill z šablony
  templateField.selectEl.addEventListener('change', () => {
    const selectedId = parseInt(templateField.selectEl.value, 10);
    if (!selectedId) return;
    const tmpl = lessonTemplates.find((t) => t.lesson_template_id === selectedId);
    if (!tmpl) return;
    nameField.inputEl.value     = tmpl.name;
    durationField.inputEl.value = String(tmpl.duration);
    capacityField.inputEl.value = String(tmpl.maximum_capacity);
    lessonTypeId                = tmpl.lesson_type_id;
    if (tmpl.description) descField.inputEl.value = tmpl.description;
  });

  // --- Výběr trenéra ---
  let employeeIdGetter;

  if (isAdmin) {
    // Admin: dropdown se jmény trenérů
    const trainerField = buildSelect('Trenér *');
    if (trainers.length === 0) {
      const opt = createElement('option', { value: '' }, [document.createTextNode('— žádní trenéři —')]);
      trainerField.selectEl.appendChild(opt);
    } else {
      trainers.forEach((tr) => {
        const opt = createElement('option', { value: String(tr.employee_id) }, [
          document.createTextNode(`${tr.name} ${tr.surname}`)
        ]);
        trainerField.selectEl.appendChild(opt);
      });
    }
    formSection.appendChild(templateField.container);
    formSection.appendChild(nameField.container);
    formSection.appendChild(startField.container);
    formSection.appendChild(durationField.container);
    formSection.appendChild(capacityField.container);
    formSection.appendChild(trainerField.container);
    formSection.appendChild(descField.container);
    employeeIdGetter = () => parseInt(trainerField.selectEl.value, 10);
  } else {
    // Trenér: zobrazí pouze své jméno, employee_id je auto
    const trainerInfoContainer = createDiv('mb-10', []);
    trainerInfoContainer.appendChild(createElement('label', { className: 'd-block mb-5 font-weight-bold' }, [
      document.createTextNode('Trenér')
    ]));
    trainerInfoContainer.appendChild(createElement('p', { className: 'form-control w-100 bg-light' }, [
      document.createTextNode(`${auth.name ?? ''} ${auth.surname ?? ''}`)
    ]));
    formSection.appendChild(templateField.container);
    formSection.appendChild(nameField.container);
    formSection.appendChild(startField.container);
    formSection.appendChild(durationField.container);
    formSection.appendChild(capacityField.container);
    formSection.appendChild(trainerInfoContainer);
    formSection.appendChild(descField.container);
    employeeIdGetter = () => auth.memberId;
  }

  const actionsRow = createDiv('mt-15', []);

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
          employee_id:      employeeIdGetter(),
          lesson_type_id:   lessonTypeId,
          lesson_template_id: templateField.selectEl.value
                              ? parseInt(templateField.selectEl.value, 10)
                              : null,
          status: 'OPEN',
        };

        if (!lessonData.name || !lessonData.start_time || isNaN(lessonData.duration) || isNaN(lessonData.maximum_capacity)) {
          alert('Vyplňte prosím všechna povinná pole s hvězdičkou správně.');
          return;
        }
        if (!lessonData.employee_id) {
          alert('Vyberte prosím trenéra.');
          return;
        }

        onSubmit(lessonData);
      },
      'Vytvořit lekci',
      'button--primary me-5',
    );
    actionsRow.appendChild(submitBtn);
  }

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
