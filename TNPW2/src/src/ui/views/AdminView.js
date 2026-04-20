// Admin pohled – správa čekajících plateb (PENDING).
//
// Zobrazí tabulku plateb čekajících na schválení.
// Každý řádek obsahuje tlačítko pro schválení (PENDING → COMPLETED).
// Přístupné pouze přihlášeným adminům (podmínka je v render.js / dispatcheru).

import { createSection } from '../builder/components/section.js';
import { createTitle } from '../builder/components/title.js';
import { createText } from '../builder/components/text.js';
import { addActionButton } from '../builder/components/button.js';
import { createElement } from '../builder/createElement.js';
import * as CONST from '../../constants.js';

export function AdminView({ viewState, handlers }) {
  const { pendingPayments } = viewState;
  const { onGoToReservations, onApprovePayment, onRejectPayment } = handlers;

  const container = createSection('container mt-15');
  container.appendChild(createTitle(1, 'Admin – čekající platby'));

  if (onGoToReservations) {
    const btnZpet = addActionButton(
      onGoToReservations,
      '← Zpět na rezervace',
      'button--success mb-15',
    );
    container.appendChild(btnZpet);
  }

  if (pendingPayments.length === 0) {
    container.appendChild(createText(['Žádné čekající platby.'], 'lead'));
    return container;
  }

  const table = createElement('table', { className: 'table table-bordered mt-10' });

  // Záhlaví
  const thead = createElement('thead', { className: 'table-dark' });
  const headerRow = createElement('tr');
  ['ID platby', 'Jméno', 'Příjmení', 'Částka (Kč)', 'Typ', 'Datum', 'Akce'].forEach((text) => {
    headerRow.appendChild(createElement('th', {}, [text]));
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Tělo
  const tbody = createElement('tbody');
  pendingPayments.forEach((platba) => {
    const row = createElement('tr');

    const datum = platba.date ? new Date(platba.date).toLocaleDateString('cs-CZ') : '–';
    const castka = platba.amount != null ? `${platba.amount} Kč` : '–';

    [
      String(platba.payment_id),
      platba.member_name ?? '–',
      platba.member_surname ?? '–',
      castka,
      platba.payment_type ?? '–',
      datum,
    ].forEach((text) => {
      row.appendChild(createElement('td', {}, [text]));
    });

    const tdAkce = createElement('td');
    if (onApprovePayment) {
      const btnSchvalit = addActionButton(
        () => onApprovePayment(platba.payment_id),
        'Schválit',
        'button--primary btn-sm',
      );
      tdAkce.appendChild(btnSchvalit);
    }
    if (onRejectPayment) {
      const btnZamitnut = addActionButton(
        () => onRejectPayment(platba.payment_id),
        'Zamítnout',
        'button--danger btn-sm',
      );
      tdAkce.appendChild(btnZamitnut);
    }
    row.appendChild(tdAkce);

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  container.appendChild(table);

  return container;
}
