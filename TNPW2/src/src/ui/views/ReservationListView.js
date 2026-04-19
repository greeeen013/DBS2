// Pohled se seznamem rezervací přihlášeného člena.
//
// IR06: Pohled NEVOLÁ dispatch přímo.
// Dostane objekt `handlers` sestavený createHandlers() (IR06 handler factory).
//
// Zobrazuje seznam rezervací s akcemi (Potvrdit / Zrušit) podle aktuálního stavu rezervace.
// Kreditový zůstatek je vždy viditelný v horní části – člen vidí, kolik kreditů má.

import { createSection } from '../builder/components/section.js';
import { createTitle } from '../builder/components/title.js';
import { createText } from '../builder/components/text.js';
import { createDiv } from '../builder/components/div.js';
import { addActionButton } from '../builder/components/button.js';

export function ReservationListView({ viewState, handlers }) {
  const { rezervace, zustatek, reservationCapabilities = [] } = viewState;
  const {
    onGoToPayments,
    onGoToProfile,
    onGoToLessons,
    reservationHandlers = [],
  } = handlers;

  const container = createSection('container mt-15');

  // Nadpis a kreditový zůstatek
  container.appendChild(createTitle(1, 'Pretorian MMA – Rezervace'));
  container.appendChild(
    createDiv('credit-balance mb-15', [
      createText([`Kreditový zůstatek: ${zustatek ?? 'načítání…'} Kč`], 'lead'),
    ]),
  );

  // IR06: Navigační tlačítka – jen pokud handler existuje
  if (onGoToPayments) {
    const btnPlatby = addActionButton(
      onGoToPayments,
      'Dobít kredity',
      'button--success mb-15 me-5',
    );
    container.appendChild(btnPlatby);
  }

  if (onGoToProfile) {
    const btnProfil = addActionButton(
      onGoToProfile,
      'Můj profil / Historie',
      'button--primary mb-15 me-5',
    );
    container.appendChild(btnProfil);
  }

  if (onGoToLessons) {
    const btnLekce = addActionButton(
      onGoToLessons,
      'Lekce',
      'button--primary mb-15',
    );
    container.appendChild(btnLekce);
  }

  // Seznam rezervací
  if (!rezervace || rezervace.length === 0) {
    container.appendChild(createText(['Žádné rezervace.'], 'text-muted'));
    return container;
  }

  const karty = createSection('cards');

  rezervace.forEach((r, idx) => {
    const caps = reservationCapabilities[idx] ?? {};
    // IR06: Per-rezervace handlery sestavené dle capabilities
    const rh = reservationHandlers[idx] ?? {};

    const karta = createDiv('card mb-10 p-15', [
      createTitle(3, `Lekce #${r.lesson_schedule_id}`),
      createText([`Stav: ${r.status}`], r.status === 'CONFIRMED' ? 'text-success' : ''),
      r.note ? createText([`Poznámka: ${r.note}`]) : '',
    ]);

    // IR06: Tlačítka jen pokud handler existuje (handler je přítomen jen pokud caps.canConfirm/canCancel)
    if (rh.onConfirm) {
      const btnConfirm = addActionButton(
        () => rh.onConfirm(r.reservation_id),
        'Potvrdit (−100 kreditů)',
        'button--primary me-5',
      );
      karta.appendChild(btnConfirm);
    }

    if (rh.onCancel) {
      const btnCancel = addActionButton(
        () => rh.onCancel(r.reservation_id),
        'Zrušit',
        'button--danger',
      );
      karta.appendChild(btnCancel);
    }

    karty.appendChild(karta);
  });

  container.appendChild(karty);
  return container;
}
