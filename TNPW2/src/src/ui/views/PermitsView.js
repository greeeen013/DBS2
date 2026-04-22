import { createElement } from '../builder/createElement.js';
import { createSection } from '../builder/components/section.js';
import { createTitle } from '../builder/components/title.js';
import { createText } from '../builder/components/text.js';
import { createDiv } from '../builder/components/div.js';
import { addActionButton } from '../builder/components/button.js';

const EXPIRY_WARNING_DAYS = 7;

function formatDate(isoString) {
  if (!isoString) return '–';
  return new Date(isoString).toLocaleDateString('cs-CZ');
}

function isExpiringSoon(validTo) {
  const diff = new Date(validTo) - new Date();
  return diff > 0 && diff < EXPIRY_WARNING_DAYS * 86400 * 1000;
}

function formatDuration(months, days) {
  const parts = [];
  if (months) parts.push(`${months} měs.`);
  if (days) parts.push(`${days} dní`);
  return parts.length ? parts.join(' + ') : '—';
}

function renderTariffCard(tariff, creditBalance, handlers, isAdmin) {
  const canAfford = (creditBalance ?? 0) >= tariff.price;

  const card = createDiv('card mb-10 p-15');

  const header = createDiv('header-actions mb-10');
  header.appendChild(createTitle(3, tariff.name));
  const priceTag = createText([`${tariff.price} kreditů`], canAfford ? 'text-success' : 'text-muted');
  header.appendChild(priceTag);
  card.appendChild(header);

  const duration = createElement('span', { style: 'font-size:0.85rem;color:#aaa;display:block;margin-bottom:6px;' }, [
    `Platnost: ${formatDuration(tariff.duration_months, tariff.duration_days)}`,
  ]);
  card.appendChild(duration);

  if (tariff.description) {
    card.appendChild(createText([tariff.description], 'text-muted'));
  }

  const buyBtn = addActionButton(
    () => {
      const remaining = (creditBalance ?? 0) - tariff.price;
      const ok = window.confirm(
        `Koupit permanentku "${tariff.name}"?\n\nCena: ${tariff.price} kreditů\nZůstatek po nákupu: ${remaining} kreditů`,
      );
      if (ok) handlers.onPurchase(tariff.tariff_id);
    },
    'Koupit',
    canAfford ? 'button--success mt-10' : 'button--secondary mt-10',
  );
  if (!canAfford) buyBtn.disabled = true;
  card.appendChild(buyBtn);

  if (isAdmin) {
    const deleteBtn = addActionButton(
      () => {
        const ok = window.confirm(`Smazat tarif "${tariff.name}"? Tato akce je nevratná.`);
        if (ok) handlers.onDeleteTariff(tariff.tariff_id);
      },
      'Smazat tarif',
      'button--danger mt-10',
    );
    card.appendChild(deleteBtn);
  }

  return card;
}

function renderMembershipRow(membership) {
  const expiring = isExpiringSoon(membership.valid_to);
  const tr = createElement('tr', {});

  tr.appendChild(createElement('td', {}, [membership.tariff_name ?? `Tarif #${membership.tariff_id}`]));
  tr.appendChild(createElement('td', {}, [formatDate(membership.valid_from)]));

  const tdTo = createElement('td', {});
  tdTo.appendChild(document.createTextNode(formatDate(membership.valid_to)));
  if (expiring) {
    const warn = createElement('span', { style: 'margin-left:8px;font-size:0.8rem;color:#ffc107;font-weight:700;' }, ['⚠ Brzy vyprší']);
    tdTo.appendChild(warn);
  }
  tr.appendChild(tdTo);

  return tr;
}

function renderCreateTariffForm(handlers) {
  const section = createDiv('card mb-10 p-15');
  section.appendChild(createTitle(4, 'Přidat nový tarif'));

  const form = createElement('form', { id: 'create-tariff-form' });

  function field(labelText, input) {
    const wrap = createDiv('mb-10');
    wrap.appendChild(createText([labelText], 'text-muted'));
    wrap.appendChild(input);
    return wrap;
  }

  const nameInput = createElement('input', {
    type: 'text',
    className: 'form-control',
    placeholder: 'Název tarifu',
    required: 'true',
  });
  const priceInput = createElement('input', {
    type: 'number',
    className: 'form-control',
    placeholder: 'Cena v kreditech',
    min: '1',
    required: 'true',
  });
  const descInput = createElement('input', {
    type: 'text',
    className: 'form-control',
    placeholder: 'Volitelný popis',
  });
  const monthsInput = createElement('input', {
    type: 'number',
    className: 'form-control',
    placeholder: 'Měsíce',
    min: '0',
    value: '1',
  });
  const daysInput = createElement('input', {
    type: 'number',
    className: 'form-control',
    placeholder: 'Dny',
    min: '0',
    value: '0',
  });

  const durationRow = createDiv('');
  durationRow.style.cssText = 'display:flex;gap:10px;';
  const monthsWrap = createDiv('mb-10');
  monthsWrap.style.cssText = 'flex:1;';
  monthsWrap.appendChild(createText(['Měsíce'], 'text-muted'));
  monthsWrap.appendChild(monthsInput);
  const daysWrap = createDiv('mb-10');
  daysWrap.style.cssText = 'flex:1;';
  daysWrap.appendChild(createText(['Dny'], 'text-muted'));
  daysWrap.appendChild(daysInput);
  durationRow.appendChild(monthsWrap);
  durationRow.appendChild(daysWrap);

  form.appendChild(field('Název', nameInput));
  form.appendChild(field('Cena (kredity)', priceInput));
  form.appendChild(field('Popis (nepovinný)', descInput));

  const durationLabel = createDiv('mb-10');
  durationLabel.appendChild(createText(['Platnost tarifu'], 'text-muted'));
  durationLabel.appendChild(durationRow);
  form.appendChild(durationLabel);

  form.appendChild(addActionButton(
    () => {},
    'Přidat tarif',
    'button--primary',
  ));

  // Přepíšeme submit na form místo click, aby fungoval required
  form.querySelector('.button--primary').type = 'submit';
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handlers.onCreateTariff({
      name: nameInput.value.trim(),
      price: parseFloat(priceInput.value),
      description: descInput.value.trim() || null,
      duration_months: parseInt(monthsInput.value, 10) || 0,
      duration_days: parseInt(daysInput.value, 10) || 0,
    });
    form.reset();
  });

  section.appendChild(form);
  return section;
}

export function PermitsView({ viewState, handlers }) {
  const { tariffs, memberships, creditBalance, isAdmin } = viewState;

  const container = createSection('container mt-15');

  // Záhlaví: nadpis + kreditový zůstatek
  const headerRow = createDiv('header-actions mb-15');
  headerRow.appendChild(createTitle(1, 'Permanentky'));
  headerRow.appendChild(createText([`Váš kredit: ${creditBalance ?? 0}`], 'lead'));
  container.appendChild(headerRow);

  container.appendChild(addActionButton(
    () => handlers.onGoToReservations(),
    '← Zpět na rezervace',
    'button--secondary mb-15',
  ));

  // ---- Dostupné tarify ----
  container.appendChild(createTitle(2, 'Dostupné tarify'));

  if (!tariffs || tariffs.length === 0) {
    container.appendChild(createText(['Žádné tarify nejsou k dispozici.'], 'text-muted'));
  } else {
    const cards = createSection('cards');
    tariffs.forEach((t) => cards.appendChild(renderTariffCard(t, creditBalance, handlers, isAdmin)));
    container.appendChild(cards);
  }

  // ---- Admin: přidání tarifu ----
  if (isAdmin) {
    container.appendChild(renderCreateTariffForm(handlers));
  }

  // ---- Moje permanentky ----
  container.appendChild(createTitle(2, 'Moje aktivní permanentky'));

  if (!memberships || memberships.length === 0) {
    container.appendChild(createText(['Žádné aktivní permanentky.'], 'text-muted'));
  } else {
    const table = createElement('table', { className: 'table table-bordered mt-10' });
    const thead = createElement('thead', { className: 'table-dark' });
    const headerTr = createElement('tr', {});
    ['Tarif', 'Platné od', 'Platné do'].forEach((h) =>
      headerTr.appendChild(createElement('th', {}, [h])),
    );
    thead.appendChild(headerTr);
    table.appendChild(thead);

    const tbody = createElement('tbody', {});
    memberships.forEach((m) => tbody.appendChild(renderMembershipRow(m)));
    table.appendChild(tbody);
    container.appendChild(table);
  }

  return container;
}
