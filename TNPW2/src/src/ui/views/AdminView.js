import { createSection } from '../builder/components/section.js';
import { createTitle } from '../builder/components/title.js';
import { createText } from '../builder/components/text.js';
import { addActionButton } from '../builder/components/button.js';
import { createElement } from '../builder/createElement.js';
import { createDiv } from '../builder/components/div.js';

export function AdminView({ viewState, handlers }) {
  const { pendingPayments } = viewState;
  const { onGoToReservations, onApprovePayment, onRejectPayment } = handlers;

  const container = createSection('container mt-15');
  container.appendChild(createTitle(1, 'Admin – správa plateb'));

  if (onGoToReservations) {
    container.appendChild(addActionButton(onGoToReservations, '← Zpět na rezervace', 'button--success mb-15'));
  }

  if (pendingPayments.length === 0) {
    container.appendChild(createText(['Žádné platby čekají na schválení.'], 'lead text-muted'));
    return container;
  }

  const badge = createElement('p', { className: 'mb-10' }, [
    'Čeká na schválení: ',
    createElement('span', { className: 'badge bg-warning text-dark' }, [String(pendingPayments.length)]),
  ]);
  container.appendChild(badge);

  const table = createElement('table', { className: 'table table-bordered mt-10' });

  const thead = createElement('thead', { className: 'table-dark' });
  const headerRow = createElement('tr');
  ['Jméno', 'Příjmení', 'Částka', 'Typ', 'Datum', 'Akce'].forEach((text) => {
    headerRow.appendChild(createElement('th', {}, [text]));
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = createElement('tbody');
  pendingPayments.forEach((platba) => {
    const row = createElement('tr');
    const datum = platba.date ? new Date(platba.date).toLocaleDateString('cs-CZ') : '–';
    const castka = platba.amount != null ? `${platba.amount} Kč` : '–';
    const typ = platba.payment_type ?? '–';

    [
      platba.member_name ?? '–',
      platba.member_surname ?? '–',
      castka,
      typ,
      datum,
    ].forEach((text) => {
      row.appendChild(createElement('td', {}, [text]));
    });

    const tdAkce = createElement('td');
    if (onApprovePayment) {
      tdAkce.appendChild(addActionButton(
        () => onApprovePayment(platba.payment_id),
        'Schválit',
        'button--primary btn-sm me-5',
      ));
    }
    if (onRejectPayment) {
      tdAkce.appendChild(addActionButton(
        () => onRejectPayment(platba.payment_id),
        'Zamítnout',
        'button--danger btn-sm',
      ));
    }
    row.appendChild(tdAkce);
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  container.appendChild(table);

  return container;
}
