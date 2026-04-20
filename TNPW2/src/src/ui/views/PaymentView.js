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

export function PaymentView({ viewState, handlers }) {
  const { platby, zustatek } = viewState;
  const { onGoToReservations, onSubmitPayment } = handlers;

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
      if (onSubmitPayment) {
        onSubmitPayment(castka);
      }
    },
    'Dobít kredity',
    'button--primary',
  );

  formDiv.appendChild(vstupLabel);
  formDiv.appendChild(vstup);
  formDiv.appendChild(btnOdeslat);
  container.appendChild(formDiv);

  // Tlačítko zpět na rezervace
  if (onGoToReservations) {
    const btnZpet = addActionButton(
      onGoToReservations,
      '← Zpět na rezervace',
      'button--success mb-15',
    );
    container.appendChild(btnZpet);
  }

  return container;
}
