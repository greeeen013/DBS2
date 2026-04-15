// Pohled se seznamem rezervací přihlášeného člena.
//
// Zobrazuje seznam rezervací s akcemi (Potvrdit / Zrušit) podle aktuálního stavu rezervace.
// Kreditový zůstatek je vždy viditelný v horní části – člen vidí, kolik kreditů má.

import { createSection } from '../builder/components/section.js';
import { createTitle } from '../builder/components/title.js';
import { createText } from '../builder/components/text.js';
import { createDiv } from '../builder/components/div.js';
import { addActionButton } from '../builder/components/button.js';
import * as CONST from '../../constants.js';

export function ReservationListView({ viewState, dispatch }) {
  const { rezervace, zustatek } = viewState;

  const container = createSection('container mt-15');

  // Nadpis a kreditový zůstatek
  container.appendChild(createTitle(1, 'Pretorian MMA – Rezervace'));
  container.appendChild(
    createDiv('credit-balance mb-15', [
      createText([`Kreditový zůstatek: ${zustatek ?? 'načítání…'} Kč`], 'lead'),
    ]),
  );

  // Tlačítko pro přechod na dobití kreditů
  const btnPlatby = addActionButton(
    () => dispatch({ type: CONST.ENTER_PAYMENT_VIEW }),
    'Dobít kredity',
    'button--success mb-15 me-5',
  );
  container.appendChild(btnPlatby);

  // Tlačítko pro přechod na profilovou historii (IR04)
  const btnProfil = addActionButton(
    () => dispatch({ type: CONST.ENTER_PROFILE_VIEW }),
    'Můj profil / Historie',
    'button--primary mb-15 me-5',
  );
  container.appendChild(btnProfil);

  // Tlačítko pro přechod na správu lekcí
  const btnLekce = addActionButton(
    () => dispatch({ type: CONST.ENTER_LESSON_LIST }),
    'Lekce',
    'button--primary mb-15',
  );
  container.appendChild(btnLekce);

  // Seznam rezervací
  if (!rezervace || rezervace.length === 0) {
    container.appendChild(createText(['Žádné rezervace.'], 'text-muted'));
    return container;
  }

  const karty = createSection('cards');

  rezervace.forEach((r) => {
    const karta = createDiv('card mb-10 p-15', [
      createTitle(3, `Lekce #${r.lesson_schedule_id}`),
      createText([`Stav: ${r.status}`], r.status === 'CONFIRMED' ? 'text-success' : ''),
      r.note ? createText([`Poznámka: ${r.note}`]) : '',
    ]);

    // Akce dostupné podle stavu rezervace
    if (r.status === 'CREATED') {
      const btnConfirm = addActionButton(
        () => dispatch({ type: CONST.CONFIRM_RESERVATION, payload: { reservationId: r.reservation_id } }),
        'Potvrdit (−100 kreditů)',
        'button--primary me-5',
      );
      karta.appendChild(btnConfirm);
    }

    if (r.status === 'CREATED' || r.status === 'CONFIRMED') {
      const btnCancel = addActionButton(
        () => dispatch({ type: CONST.CANCEL_RESERVATION, payload: { reservationId: r.reservation_id } }),
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
