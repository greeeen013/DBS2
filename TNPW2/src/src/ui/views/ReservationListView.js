import { createSection } from '../builder/components/section.js';
import { createTitle } from '../builder/components/title.js';
import { createText } from '../builder/components/text.js';
import { createDiv } from '../builder/components/div.js';
import { addActionButton } from '../builder/components/button.js';
import { createElement } from '../builder/createElement.js';

function stavLabel(status) {
  const m = { CREATED: 'Čeká na potvrzení', CONFIRMED: 'Potvrzená', CANCELLED: 'Zrušená', ATTENDED: 'Absolvována' };
  return m[status] ?? status;
}

function stavClass(status) {
  const m = { CREATED: 'text-warning', CONFIRMED: 'text-success', CANCELLED: 'text-danger', ATTENDED: 'text-info' };
  return m[status] ?? 'text-muted';
}

function formatTime(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleString('cs-CZ', { dateStyle: 'short', timeStyle: 'short' });
}

export function ReservationListView({ viewState, handlers }) {
  const { rezervace, zustatek, reservationCapabilities = [] } = viewState;
  const { onGoToPayments, onGoToProfile, onGoToLessons, reservationHandlers = [] } = handlers;

  const container = createSection('container mt-15');

  container.appendChild(createTitle(1, 'Pretorian MMA – Rezervace'));

  // Kreditový zůstatek
  const balanceDiv = createDiv('credit-balance mb-15');
  const balanceText = createElement('span', { className: 'lead fw-semibold' }, [
    `Kreditový zůstatek: ${zustatek ?? '…'} Kč`,
  ]);
  balanceDiv.appendChild(balanceText);
  container.appendChild(balanceDiv);

  // Navigační tlačítka
  const navRow = createDiv('mb-15');
  if (onGoToPayments) navRow.appendChild(addActionButton(onGoToPayments, 'Dobít kredity', 'button--success me-5'));
  if (onGoToProfile)  navRow.appendChild(addActionButton(onGoToProfile,  'Můj profil', 'button--primary me-5'));
  if (onGoToLessons)  navRow.appendChild(addActionButton(onGoToLessons,  'Přehled lekcí', 'button--primary'));
  container.appendChild(navRow);

  if (!rezervace || rezervace.length === 0) {
    container.appendChild(createText(['Žádné rezervace. Přihlaste se na lekci v přehledu lekcí.'], 'text-muted'));
    return container;
  }

  // Aktivní a historické rezervace odděleně
  const aktivni = rezervace.filter((r) => r.status === 'CREATED' || r.status === 'CONFIRMED');
  const ostatni = rezervace.filter((r) => r.status !== 'CREATED' && r.status !== 'CONFIRMED');

  function renderKarty(seznam) {
    const sekce = createSection('cards');
    seznam.forEach((r, idx) => {
      const rh = reservationHandlers[rezervace.indexOf(r)] ?? {};

      const nazev = r.lesson_name ?? 'Neznámá lekce';
      const cas = formatTime(r.lesson_start_time);
      const datumRez = formatTime(r.timestamp_creation);

      const karta = createDiv(`card mb-10 p-15 ${r.status === 'CANCELLED' ? 'card--cancelled' : ''}`);

      // Záhlaví: název + status badge
      const hlavicka = createDiv('lesson-card__header mb-5');
      const nadpis = createElement('h3', { className: 'lesson-card__title mb-0' }, [nazev]);
      const badge = createElement('span', {
        className: `lesson-card__badge badge--${r.status === 'CONFIRMED' ? 'open' : r.status === 'CREATED' ? 'draft' : r.status === 'CANCELLED' ? 'cancelled' : 'completed'}`,
      }, [stavLabel(r.status)]);
      hlavicka.appendChild(nadpis);
      hlavicka.appendChild(badge);
      karta.appendChild(hlavicka);

      if (cas) {
        karta.appendChild(createElement('p', { className: 'text-muted mb-5' }, [`Začátek lekce: ${cas}`]));
      }
      if (datumRez) {
        karta.appendChild(createElement('p', { className: 'text-muted mb-5' }, [`Rezervováno: ${datumRez}`]));
      }
      if (r.note) {
        karta.appendChild(createElement('p', { className: 'text-muted mb-5' }, [`Poznámka: ${r.note}`]));
      }

      // Akční tlačítka
      const akce = createDiv('lesson-card__actions mt-10');
      if (rh.onConfirm) {
        akce.appendChild(addActionButton(
          () => rh.onConfirm(r.reservation_id),
          'Potvrdit (−100 Kč)',
          'button--primary me-5',
        ));
      }
      if (rh.onCancel) {
        akce.appendChild(addActionButton(
          () => rh.onCancel(r.reservation_id),
          'Zrušit rezervaci',
          'button--danger',
        ));
      }
      if (akce.childNodes.length > 0) karta.appendChild(akce);

      sekce.appendChild(karta);
    });
    return sekce;
  }

  if (aktivni.length > 0) {
    container.appendChild(createTitle(2, 'Moje přihlášky'));
    container.appendChild(renderKarty(aktivni));
  }

  if (ostatni.length > 0) {
    container.appendChild(createTitle(2, 'Historie'));
    container.appendChild(renderKarty(ostatni));
  }

  return container;
}
