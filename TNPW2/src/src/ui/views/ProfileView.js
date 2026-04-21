import { createSection } from '../builder/components/section.js';
import { createTitle } from '../builder/components/title.js';
import { createText } from '../builder/components/text.js';
import { createDiv } from '../builder/components/div.js';
import { addActionButton } from '../builder/components/button.js';
import { createElement } from '../builder/createElement.js';

function stavRez(status) {
  const m = { CREATED: 'Čeká na potvrzení', CONFIRMED: 'Potvrzená', CANCELLED: 'Zrušená', ATTENDED: 'Absolvována' };
  return m[status] ?? status;
}

function stavRezClass(status) {
  const m = { CREATED: 'text-warning', CONFIRMED: 'text-success', CANCELLED: 'text-danger', ATTENDED: 'text-info' };
  return m[status] ?? 'text-muted';
}

function stavPlatby(status) {
  const m = { PENDING: 'Čeká na schválení', COMPLETED: 'Schválená', REJECTED: 'Zamítnutá' };
  return m[status] ?? status;
}

function stavPlatbyClass(status) {
  const m = { PENDING: 'text-warning', COMPLETED: 'text-success', REJECTED: 'text-danger' };
  return m[status] ?? 'text-muted';
}

function formatDate(iso) {
  if (!iso) return '–';
  return new Date(iso).toLocaleString('cs-CZ', { dateStyle: 'short', timeStyle: 'short' });
}

export function ProfileView({ viewState, handlers }) {
  const { historyReservations, historyPayments } = viewState;
  const { onGoToReservations } = handlers;

  const container = createSection('container mt-15');
  container.appendChild(createTitle(1, 'Můj profil'));

  if (onGoToReservations) {
    container.appendChild(addActionButton(onGoToReservations, '← Zpět na rezervace', 'button--success mb-15'));
  }

  // --- Sekce: Moje rezervace ---
  container.appendChild(createTitle(2, 'Moje přihlášky na lekce'));

  if (!historyReservations || historyReservations.length === 0) {
    container.appendChild(createText(['Zatím žádné přihlášky.'], 'text-muted mb-15'));
  } else {
    const seznam = createSection('reservations-history-list mb-15');

    historyReservations.forEach((r) => {
      const nazev = r.lesson_name ?? 'Neznámá lekce';
      const casLekce = r.lesson_start_time
        ? new Date(r.lesson_start_time).toLocaleString('cs-CZ', { dateStyle: 'long', timeStyle: 'short' })
        : null;
      const casRezervace = formatDate(r.timestamp_creation);

      const karta = createDiv('card mb-5 p-10');

      // Řádek: název + status
      const hlavicka = createDiv('d-flex justify-between align-center mb-3');
      hlavicka.appendChild(createElement('strong', {}, [nazev]));
      hlavicka.appendChild(createElement('span', { className: stavRezClass(r.status) }, [stavRez(r.status)]));
      karta.appendChild(hlavicka);

      if (casLekce) {
        karta.appendChild(createElement('p', { className: 'text-muted mb-0' }, [`Termín: ${casLekce}`]));
      }
      karta.appendChild(createElement('p', { className: 'text-muted mb-0' }, [`Přihlášeno: ${casRezervace}`]));

      seznam.appendChild(karta);
    });

    container.appendChild(seznam);
  }

  // --- Sekce: Moje platby ---
  container.appendChild(createTitle(2, 'Historie plateb'));

  if (!historyPayments || historyPayments.length === 0) {
    container.appendChild(createText(['Zatím žádné platby.'], 'text-muted'));
  } else {
    const seznam = createSection('payments-history-list');

    historyPayments.forEach((p) => {
      const datum = formatDate(p.date ?? p.timestamp_creation);
      const karta = createDiv('card mb-5 p-10');

      const hlavicka = createDiv('d-flex justify-between align-center mb-3');
      hlavicka.appendChild(createElement('strong', {}, [`${p.amount} Kč – ${p.payment_type ?? 'kredit'}`]));
      hlavicka.appendChild(createElement('span', { className: stavPlatbyClass(p.status) }, [stavPlatby(p.status)]));
      karta.appendChild(hlavicka);

      karta.appendChild(createElement('p', { className: 'text-muted mb-0' }, [`Datum: ${datum}`]));
      seznam.appendChild(karta);
    });

    container.appendChild(seznam);
  }

  return container;
}
