// Pohled pro vytvoření nové lekce.
//
// handlers.onSubmit({ lessonData, recurrence }) → CREATE_LESSON
// handlers.onCancel()                           → ENTER_LESSON_LIST
// handlers.onSaveTemplate(templateData)         → SAVE_LESSON_TEMPLATE
//
// viewState: trainers[], lessonTemplates[], tariffs[], archivedTariffs[], auth {}

import { createSection } from '../builder/components/section.js';
import { createTitle } from '../builder/components/title.js';
import { createDiv } from '../builder/components/div.js';
import { addActionButton } from '../builder/components/button.js';
import { createElement } from '../builder/createElement.js';

const DAYS_CZ = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];

export function LessonCreationView({ viewState, handlers }) {
  const { onSubmit, onCancel, onSaveTemplate } = handlers;
  const { trainers = [], lessonTemplates = [], tariffs = [], archivedTariffs = [], auth = {} } = viewState;
  const isAdmin = auth.role === 'admin';

  const container = createSection('container mt-15');
  container.appendChild(createTitle(1, 'Vytvoření nové lekce'));

  const formSection = createSection('card p-15');

  // ---- Pomocné buildery ------------------------------------------------

  const buildField = (labelText, inputOptions, inputType = 'input') => {
    const wrap = createDiv('mb-10', []);
    wrap.appendChild(createElement('label', { className: 'd-block mb-5 font-weight-bold' }, [
      document.createTextNode(labelText),
    ]));
    const el = inputType === 'textarea'
      ? createElement('textarea', { className: 'form-control w-100', ...inputOptions }, [])
      : createElement('input', { className: 'form-control w-100', ...inputOptions }, []);
    wrap.appendChild(el);
    return { container: wrap, inputEl: el };
  };

  const buildSelect = (labelText) => {
    const wrap = createDiv('mb-10', []);
    wrap.appendChild(createElement('label', { className: 'd-block mb-5 font-weight-bold' }, [
      document.createTextNode(labelText),
    ]));
    const selectEl = createElement('select', { className: 'form-control w-100' }, []);
    wrap.appendChild(selectEl);
    return { container: wrap, selectEl };
  };

  // ---- Šablona ---------------------------------------------------------

  const templateField = buildSelect('Šablona lekce (nepovinné)');
  templateField.selectEl.appendChild(
    createElement('option', { value: '' }, [document.createTextNode('— bez šablony —')]),
  );
  lessonTemplates.forEach((t) => {
    templateField.selectEl.appendChild(
      createElement('option', { value: String(t.lesson_template_id) }, [
        document.createTextNode(t.name),
      ]),
    );
  });

  // ---- Základní pole ---------------------------------------------------

  const nameField     = buildField('Název lekce *', { type: 'text', required: true });
  const startField    = buildField('Čas začátku *', { type: 'datetime-local', required: true });
  const durationField = buildField('Délka (minuty) *', { type: 'number', min: '1', value: '60', required: true });
  const capacityField = buildField('Max. kapacita *', { type: 'number', min: '1', value: '20', required: true });
  const descField     = buildField('Popis lekce', { rows: 3 }, 'textarea');

  let lessonTypeId = 1;

  // Auto-fill z šablony
  templateField.selectEl.addEventListener('change', () => {
    const id = parseInt(templateField.selectEl.value, 10);
    if (!id) return;
    const tmpl = lessonTemplates.find((t) => t.lesson_template_id === id);
    if (!tmpl) return;
    nameField.inputEl.value     = tmpl.name;
    durationField.inputEl.value = String(tmpl.duration);
    capacityField.inputEl.value = String(tmpl.maximum_capacity);
    lessonTypeId                = tmpl.lesson_type_id;
    if (tmpl.description) descField.inputEl.value = tmpl.description;
    // Předvyber tarify šablony
    if (tmpl.allowed_tariff_ids?.length) {
      tariffCheckboxes.forEach((cb) => {
        cb.checked = tmpl.allowed_tariff_ids.includes(parseInt(cb.value, 10));
      });
    }
  });

  // ---- Výběr trenéra ---------------------------------------------------

  let employeeIdGetter;

  if (isAdmin) {
    const trainerField = buildSelect('Trenér *');
    if (trainers.length === 0) {
      trainerField.selectEl.appendChild(
        createElement('option', { value: '' }, [document.createTextNode('— žádní trenéři —')]),
      );
    } else {
      trainers.forEach((tr) => {
        trainerField.selectEl.appendChild(
          createElement('option', { value: String(tr.employee_id) }, [
            document.createTextNode(`${tr.name} ${tr.surname}`),
          ]),
        );
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
    // Trenér: zobrazí jen své jméno – styled dark (ne bg-light)
    const trainerInfoWrap = createDiv('mb-10', []);
    trainerInfoWrap.appendChild(
      createElement('label', { className: 'd-block mb-5 font-weight-bold' }, [
        document.createTextNode('Trenér'),
      ]),
    );
    const trainerDisplay = createElement('div', { className: 'trainer-display' }, [
      document.createTextNode(`${auth.name ?? ''} ${auth.surname ?? ''}`),
    ]);
    trainerInfoWrap.appendChild(trainerDisplay);
    formSection.appendChild(templateField.container);
    formSection.appendChild(nameField.container);
    formSection.appendChild(startField.container);
    formSection.appendChild(durationField.container);
    formSection.appendChild(capacityField.container);
    formSection.appendChild(trainerInfoWrap);
    formSection.appendChild(descField.container);
    employeeIdGetter = () => auth.memberId;
  }

  // ---- Výběr permanentek (multi-select) --------------------------------

  const tariffWrap = createDiv('mb-10', []);
  tariffWrap.appendChild(
    createElement('label', { className: 'd-block mb-5 font-weight-bold' }, [
      document.createTextNode('Povolené permanentky (nepovinné – prázdné = pro všechny)'),
    ]),
  );
  const tariffList = createElement('div', { className: 'tariff-checkbox-list' }, []);

  const tariffCheckboxes = [];

  const addTariffCheckbox = (t, isArchived) => {
    const row = createElement('label', { className: `tariff-checkbox-row${isArchived ? ' tariff-archived' : ''}` }, []);
    const cb = createElement('input', { type: 'checkbox', value: String(t.tariff_id) }, []);
    tariffCheckboxes.push(cb);
    row.appendChild(cb);
    row.appendChild(document.createTextNode(` ${t.name}${isArchived ? ' (archivovaná)' : ''}`));
    tariffList.appendChild(row);
  };

  tariffs.forEach((t) => addTariffCheckbox(t, false));

  if (archivedTariffs.length > 0) {
    const sep = createElement('div', { className: 'tariff-separator' }, [
      document.createTextNode('─ archivované ─'),
    ]);
    tariffList.appendChild(sep);
    archivedTariffs.forEach((t) => addTariffCheckbox(t, true));
  }

  tariffWrap.appendChild(tariffList);
  formSection.appendChild(tariffWrap);

  const getAllowedTariffIds = () =>
    tariffCheckboxes.filter((cb) => cb.checked).map((cb) => parseInt(cb.value, 10));

  // ---- Opakování -------------------------------------------------------

  const recurrenceWrap = createDiv('mb-10', []);
  recurrenceWrap.appendChild(
    createElement('label', { className: 'd-block mb-5 font-weight-bold' }, [
      document.createTextNode('Opakování lekce'),
    ]),
  );

  const recurrenceSelect = createElement('select', { className: 'form-control w-100 mb-5' }, []);
  [
    ['none', 'Neopakovat'],
    ['weekly', 'Každý týden (vybrané dny)'],
    ['biweekly', 'Každý druhý týden (vybrané dny)'],
    ['workdays', 'Každý pracovní den (Po–Pá)'],
    ['ndays', 'Každých N dní'],
  ].forEach(([val, label]) => {
    recurrenceSelect.appendChild(
      createElement('option', { value: val }, [document.createTextNode(label)]),
    );
  });
  recurrenceWrap.appendChild(recurrenceSelect);

  // Dny v týdnu (pro weekly / biweekly)
  const daysWrap = createElement('div', { className: 'recurrence-days mb-5 hidden' }, []);
  const dayCheckboxes = DAYS_CZ.map((d, i) => {
    const lbl = createElement('label', { className: 'recurrence-day-label' }, []);
    const cb = createElement('input', { type: 'checkbox', value: String(i) }, []);
    lbl.appendChild(cb);
    lbl.appendChild(document.createTextNode(d));
    daysWrap.appendChild(lbl);
    return cb;
  });
  recurrenceWrap.appendChild(daysWrap);

  // Interval pro ndays
  const intervalWrap = createElement('div', { className: 'mb-5 hidden' }, []);
  intervalWrap.appendChild(document.createTextNode('Počet dní: '));
  const intervalInput = createElement('input', { type: 'number', min: '1', value: '7', className: 'form-control d-inline-block', style: 'width:80px' }, []);
  intervalWrap.appendChild(intervalInput);
  recurrenceWrap.appendChild(intervalWrap);

  // Opakovat do
  const untilWrap = createElement('div', { className: 'mb-5 hidden' }, []);
  untilWrap.appendChild(
    createElement('label', { className: 'd-block mb-5' }, [document.createTextNode('Opakovat do:')]),
  );
  const untilInput = createElement('input', { type: 'date', className: 'form-control w-100' }, []);
  untilWrap.appendChild(untilInput);
  recurrenceWrap.appendChild(untilWrap);

  recurrenceSelect.addEventListener('change', () => {
    const val = recurrenceSelect.value;
    daysWrap.classList.toggle('hidden', val !== 'weekly' && val !== 'biweekly');
    intervalWrap.classList.toggle('hidden', val !== 'ndays');
    untilWrap.classList.toggle('hidden', val === 'none');
  });

  const getRecurrence = () => {
    const type = recurrenceSelect.value;
    if (type === 'none') return null;
    return {
      type,
      days: dayCheckboxes.filter((cb) => cb.checked).map((cb) => parseInt(cb.value, 10)),
      interval: parseInt(intervalInput.value, 10) || 7,
      until: untilInput.value || null,
    };
  };

  formSection.appendChild(recurrenceWrap);

  // ---- Tlačítka --------------------------------------------------------

  const actionsRow = createDiv('mt-15 lesson-form-actions', []);

  if (onSubmit) {
    const submitBtn = addActionButton(
      () => {
        const lessonData = {
          name:              nameField.inputEl.value.trim(),
          description:       descField.inputEl.value || null,
          duration:          parseInt(durationField.inputEl.value, 10),
          start_time:        startField.inputEl.value
                               ? new Date(startField.inputEl.value).toISOString()
                               : null,
          maximum_capacity:  parseInt(capacityField.inputEl.value, 10),
          employee_id:       employeeIdGetter(),
          lesson_type_id:    lessonTypeId,
          lesson_template_id: templateField.selectEl.value
                               ? parseInt(templateField.selectEl.value, 10)
                               : null,
          status:            'OPEN',
          allowed_tariff_ids: getAllowedTariffIds(),
        };

        if (!lessonData.name || !lessonData.start_time || isNaN(lessonData.duration) || isNaN(lessonData.maximum_capacity)) {
          alert('Vyplňte prosím všechna povinná pole (označená *).');
          return;
        }
        if (!lessonData.employee_id) {
          alert('Vyberte prosím trenéra.');
          return;
        }
        const rec = getRecurrence();
        if (rec && rec.type !== 'none' && !rec.until) {
          alert('Zadejte prosím datum opakování "Opakovat do".');
          return;
        }

        onSubmit({ lessonData, recurrence: rec });
      },
      'Vytvořit lekci',
      'button--primary me-5',
    );
    actionsRow.appendChild(submitBtn);
  }

  // Uložit jako šablonu
  if (onSaveTemplate) {
    const saveTemplateBtn = addActionButton(
      () => {
        const name = nameField.inputEl.value.trim();
        if (!name) { alert('Nejdříve zadejte název lekce.'); return; }
        onSaveTemplate({
          name,
          description: descField.inputEl.value || null,
          duration: parseInt(durationField.inputEl.value, 10) || 60,
          maximum_capacity: parseInt(capacityField.inputEl.value, 10) || 20,
          price: 0,
          lesson_type_id: lessonTypeId,
          allowed_tariff_ids: getAllowedTariffIds(),
        });
      },
      'Uložit jako šablonu',
      'button--secondary me-5',
    );
    actionsRow.appendChild(saveTemplateBtn);
  }

  if (onCancel) {
    actionsRow.appendChild(addActionButton(onCancel, 'Zrušit', 'button--danger'));
  }

  formSection.appendChild(actionsRow);
  container.appendChild(formSection);
  return container;
}
