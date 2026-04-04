// Pohled: kombinovaná historie přihlášeného člena (IR04).
//
// Zobrazuje seznam rezervací a plateb seřazených sestupně dle data
// (řazení zajišťuje backend – GET /me/history).

import { createSection } from '../builder/components/section.js';
import { createTitle } from '../builder/components/title.js';
import { createText } from '../builder/components/text.js';
import { createDiv } from '../builder/components/div.js';
import { addActionButton } from '../builder/components/button.js';
import * as CONST from '../../constants.js';

export function ProfileView({ viewState, dispatch }) {
  const { historyReservations, historyPayments } = viewState;

  const container = createSection('container mt-15');

  container.appendChild(createTitle(1, 'Můj profil – Historie'));

  // Tlačítko zpět na rezervace
  const btnZpet = addActionButton(
    () => dispatch({ type: CONST.ENTER_RESERVATION_LIST }),
    '← Zpět na rezervace',
    'button--success mb-15',
  );
  container.appendChild(btnZpet);

  // Sekce: Moje rezervace
  container.appendChild(createTitle(2, 'Moje rezervace'));

  if (!historyReservations || historyReservations.length === 0) {
    container.appendChild(createText(['Žádné rezervace.'], 'text-muted'));
  } else {
    const seznamRezervaci = createSection('reservations-history-list');
    historyReservations.forEach((r) => {
      const datum = r.timestamp_creation
        ? new Date(r.timestamp_creation).toLocaleString('cs-CZ')
        : '–';
      seznamRezervaci.appendChild(
        createDiv('card mb-5 p-10', [
          createText([`Lekce #${r.lesson_schedule_id}`], 'mb-0'),
          createText(
            [`Stav: ${r.status}`],
            r.status === 'CONFIRMED' || r.status === 'ATTENDED' ? 'text-success' : 'text-muted',
          ),
          createText([`Vytvořeno: ${datum}`], 'text-muted'),
        ]),
      );
    });
    container.appendChild(seznamRezervaci);
  }

  // Sekce: Moje platby
  container.appendChild(createTitle(2, 'Moje platby'));

  if (!historyPayments || historyPayments.length === 0) {
    container.appendChild(createText(['Žádné platby.'], 'text-muted'));
  } else {
    const seznamPlateb = createSection('payments-history-list');
    historyPayments.forEach((p) => {
      const datum = p.date
        ? new Date(p.date).toLocaleString('cs-CZ')
        : '–';
      seznamPlateb.appendChild(
        createDiv('card mb-5 p-10', [
          createText([`${p.amount} Kč – ${p.payment_type}`], 'mb-0'),
          createText(
            [`Stav: ${p.status}`],
            p.status === 'COMPLETED' ? 'text-success' : 'text-muted',
          ),
          createText([`Datum: ${datum}`], 'text-muted'),
        ]),
      );
    });
    container.appendChild(seznamPlateb);
  }

  return container;
}
