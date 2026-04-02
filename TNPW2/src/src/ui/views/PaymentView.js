// Pohled pro dobití kreditů.
//
// Umožňuje zadat částku a odeslat platbu na backend.
// Zobrazuje historii plateb a aktuální kreditový zůstatek.

import { createSection } from '../builder/components/section.js';
import { createTitle } from '../builder/components/title.js';
import { createText } from '../builder/components/text.js';
import { createDiv } from '../builder/components/div.js';
import { addActionButton } from '../builder/components/button.js';
import { createElement } from '../builder/createElement.js';
import * as CONST from '../../constants.js';

export function PaymentView({ viewState, dispatch }) {
  const { platby, zustatek } = viewState;

  const container = createSection('container mt-15');

  container.appendChild(createTitle(1, 'Dobití kreditů'));
  container.appendChild(
    createText([`Aktuální zůstatek: ${zustatek ?? 0} Kč`], 'lead mb-15'),
  );

  // Formulář pro zadání výše platby
  const formDiv = createDiv('payment-form mb-15');

  const vstupLabel = createElement('label', { className: 'form-label' }, ['Výše platby (Kč):']);
  const vstup = createElement('input', {
    type: 'number',
    className: 'form-control mb-10',
    id: 'payment-amount',
    placeholder: '300',
    min: '100',
    step: '100',
  });

  const btnOdeslat = addActionButton(
    () => {
      const castka = Number(vstup.value);
      if (!castka || castka <= 0) {
        vstup.focus();
        return;
      }
      dispatch({ type: CONST.CREATE_PAYMENT, payload: { amount: castka } });
    },
    'Dobít kredity',
    'button--primary',
  );

  formDiv.appendChild(vstupLabel);
  formDiv.appendChild(vstup);
  formDiv.appendChild(btnOdeslat);
  container.appendChild(formDiv);

  // Tlačítko zpět na rezervace
  const btnZpet = addActionButton(
    () => dispatch({ type: CONST.ENTER_RESERVATION_LIST }),
    '← Zpět na rezervace',
    'button--success mb-15',
  );
  container.appendChild(btnZpet);

  // Historie plateb
  container.appendChild(createTitle(2, 'Historie plateb'));

  if (!platby || platby.length === 0) {
    container.appendChild(createText(['Žádné platby.'], 'text-muted'));
    return container;
  }

  const seznam = createSection('payments-list');
  platby.forEach((p) => {
    seznam.appendChild(
      createDiv('card mb-5 p-10', [
        createText([`${p.amount} Kč – ${p.payment_type}`], 'mb-0'),
        createText([`Stav: ${p.status}`], p.status === 'COMPLETED' ? 'text-success' : 'text-muted'),
      ]),
    );
  });

  container.appendChild(seznam);
  return container;
}
