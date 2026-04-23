import { createSection } from '../builder/components/section.js';
import { createTitle } from '../builder/components/title.js';
import { createText } from '../builder/components/text.js';
import { addActionButton } from '../builder/components/button.js';
import { createElement } from '../builder/createElement.js';

function formatDate(iso) {
  if (!iso) return '–';
  return new Date(iso).toLocaleDateString('cs-CZ');
}

function buildPendingPaymentsSection(pendingPayments, onApprovePayment, onRejectPayment) {
  const section = createElement('div', { className: 'mb-20' });
  section.appendChild(createTitle(2, 'Platby čekající na schválení'));

  if (pendingPayments.length === 0) {
    section.appendChild(createText(['Žádné platby čekají na schválení.'], 'text-muted'));
    return section;
  }

  const badge = createElement('p', { className: 'mb-10' }, [
    'Čeká na schválení: ',
    createElement('span', { className: 'badge bg-warning text-dark' }, [String(pendingPayments.length)]),
  ]);
  section.appendChild(badge);

  const table = createElement('table', { className: 'table table-bordered mt-10' });
  const thead = createElement('thead', { className: 'table-dark' });
  const headerRow = createElement('tr');
  ['Jméno', 'Příjmení', 'Částka', 'Typ', 'Datum', 'Akce'].forEach((text) =>
    headerRow.appendChild(createElement('th', {}, [text])),
  );
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = createElement('tbody');
  pendingPayments.forEach((platba) => {
    const row = createElement('tr');
    [
      platba.member_name ?? '–',
      platba.member_surname ?? '–',
      platba.amount != null ? `${platba.amount} Kč` : '–',
      platba.payment_type ?? '–',
      formatDate(platba.date),
    ].forEach((text) => row.appendChild(createElement('td', {}, [text])));

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
  section.appendChild(table);
  return section;
}

function buildMembersNoMembershipSection(members) {
  const section = createElement('div', { className: 'mb-20' });
  section.appendChild(createTitle(2, 'Členové bez aktivní permanentky'));

  if (members.length === 0) {
    section.appendChild(createText(['Všichni členové mají aktivní permanentku.'], 'text-muted'));
    return section;
  }

  section.appendChild(createElement('p', { className: 'text-muted mb-10' }, [
    `Celkem: ${members.length} člen${members.length === 1 ? '' : 'ů'}`,
  ]));

  const table = createElement('table', { className: 'table table-bordered' });
  const thead = createElement('thead', { className: 'table-dark' });
  const headerRow = createElement('tr');
  ['Jméno', 'Příjmení', 'Email', 'Kredit', 'Poslední permanentka'].forEach((text) =>
    headerRow.appendChild(createElement('th', {}, [text])),
  );
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = createElement('tbody');
  members.forEach((m) => {
    const row = createElement('tr');
    [
      m.name ?? '–',
      m.surname ?? '–',
      m.email ?? '–',
      `${m.credit_balance ?? 0} Kč`,
      m.last_membership_expiry ? formatDate(m.last_membership_expiry) : 'Nikdy',
    ].forEach((text) => row.appendChild(createElement('td', {}, [text])));
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  section.appendChild(table);
  return section;
}

function buildTrainerStatsSection(stats) {
  const section = createElement('div', { className: 'mb-20' });
  section.appendChild(createTitle(2, 'Statistiky trenérů'));

  if (stats.length === 0) {
    section.appendChild(createText(['Žádní trenéři nenalezeni.'], 'text-muted'));
    return section;
  }

  const table = createElement('table', { className: 'table table-bordered' });
  const thead = createElement('thead', { className: 'table-dark' });
  const headerRow = createElement('tr');
  ['Trenér', 'Počet lekcí', 'Celkem rezervací', 'Reálná docházka'].forEach((text) =>
    headerRow.appendChild(createElement('th', {}, [text])),
  );
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = createElement('tbody');
  stats.forEach((t) => {
    const row = createElement('tr');
    [
      `${t.name} ${t.surname}`,
      String(t.total_lessons ?? 0),
      String(t.total_reservations ?? 0),
      String(t.attended_count ?? 0),
    ].forEach((text) => row.appendChild(createElement('td', {}, [text])));
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  section.appendChild(table);
  return section;
}

export function AdminView({ viewState, handlers }) {
  const { pendingPayments, membersNoMembership, trainerStats } = viewState;
  const { onGoToReservations, onApprovePayment, onRejectPayment } = handlers;

  const container = createSection('container mt-15');
  container.appendChild(createTitle(1, 'Admin panel'));

  if (onGoToReservations) {
    container.appendChild(addActionButton(onGoToReservations, '← Zpět na rezervace', 'button--success mb-15'));
  }

  container.appendChild(buildPendingPaymentsSection(pendingPayments, onApprovePayment, onRejectPayment));
  container.appendChild(createElement('hr'));
  container.appendChild(buildMembersNoMembershipSection(membersNoMembership ?? []));
  container.appendChild(createElement('hr'));
  container.appendChild(buildTrainerStatsSection(trainerStats ?? []));

  return container;
}
