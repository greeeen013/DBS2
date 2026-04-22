import { createSection } from '../builder/components/section.js';
import { createTitle } from '../builder/components/title.js';
import { createText } from '../builder/components/text.js';
import { createDiv } from '../builder/components/div.js';
import { addActionButton } from '../builder/components/button.js';
import { createElement } from '../builder/createElement.js';

function stavPlatby(status) {
  const m = { PENDING: 'Čeká na schválení', COMPLETED: 'Schválená', REJECTED: 'Zamítnutá' };
  return m[status] ?? status;
}

function stavClass(status) {
  const m = { PENDING: 'text-warning', COMPLETED: 'text-success', REJECTED: 'text-danger' };
  return m[status] ?? 'text-muted';
}

export function PaymentView({ viewState, handlers }) {
  const { platby, zustatek } = viewState;
  const { onGoToReservations, onSubmitPayment } = handlers;

  const container = createSection('container mt-15');

  container.appendChild(createTitle(1, 'Dobití kreditů'));
  container.appendChild(
    createElement('p', { className: 'lead mb-15' }, [
      'Aktuální zůstatek: ',
      createElement('strong', {}, [`${zustatek ?? 0} Kč`]),
    ]),
  );

  // Formulář
  const formDiv = createDiv('payment-form mb-20 card p-15');
  formDiv.appendChild(createElement('label', { className: 'form-label' }, ['Výše platby (Kč):']));
  const vstup = createElement('input', {
    type: 'number',
    className: 'form-control mb-10',
    id: 'payment-amount',
    placeholder: '300',
    min: '100',
    step: '100',
  });
  formDiv.appendChild(vstup);
  formDiv.appendChild(addActionButton(
    () => {
      const castka = Number(vstup.value);
      if (!castka || castka < 100) { vstup.focus(); return; }
      if (onSubmitPayment) onSubmitPayment(castka);
    },
    'Odeslat žádost o dobití',
    'button--primary',
  ));
  container.appendChild(formDiv);

  if (onGoToReservations) {
    container.appendChild(addActionButton(onGoToReservations, '← Zpět na rezervace', 'button--success mb-20'));
  }

  // Historie plateb
  if (platby && platby.length > 0) {
    container.appendChild(createTitle(2, 'Historie plateb'));
    const seznam = createSection('payments-list');

    platby.forEach((p) => {
      const datum = p.date
        ? new Date(p.date).toLocaleString('cs-CZ', { dateStyle: 'short', timeStyle: 'short' })
        : '–';
      const karta = createDiv('card mb-5 p-10');

      const hlavicka = createDiv('d-flex justify-between align-center mb-3');
      hlavicka.appendChild(createElement('strong', {}, [`${p.amount} Kč`]));
      hlavicka.appendChild(createElement('span', { className: stavClass(p.status) }, [stavPlatby(p.status)]));
      karta.appendChild(hlavicka);

      karta.appendChild(createElement('p', { className: 'text-muted mb-0' }, [
        `Typ: ${p.payment_type ?? '–'} · Datum: ${datum}`,
      ]));
      seznam.appendChild(karta);
    });

    container.appendChild(seznam);
  }

  return container;
}
