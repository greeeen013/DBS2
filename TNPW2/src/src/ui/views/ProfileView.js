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
  const { historyReservations, historyPayments, photoUrl, memberName, memberSurname } = viewState;
  const { onGoToReservations, onUploadPhoto, onGoToPayments } = handlers;

  const container = createSection('container mt-15');
  container.appendChild(createTitle(1, 'Můj profil'));

  if (onGoToReservations) {
    container.appendChild(addActionButton(onGoToReservations, '← Zpět na rezervace', 'button--success mb-15'));
  }

  // --- Sekce: Profilová fotka ---
  const photoSection = createDiv('card p-15 mb-20 d-flex align-center');

  const img = createElement('img', {
    src: photoUrl ? `http://localhost:8000${photoUrl}` : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"%3E%3Crect width="80" height="80" rx="40" fill="%23444"%2F%3E%3Ctext x="40" y="48" text-anchor="middle" font-size="32" fill="%23aaa"%3E%3F%3C%2Ftext%3E%3C%2Fsvg%3E',
    alt: 'Profilová fotka',
    style: 'width:80px;height:80px;border-radius:50%;object-fit:cover;margin-right:20px;',
  });
  photoSection.appendChild(img);

  const photoInfo = createDiv('');
  if (memberName || memberSurname) {
    photoInfo.appendChild(createElement('p', { className: 'fw-semibold mb-5' }, [`${memberName ?? ''} ${memberSurname ?? ''}`.trim()]));
  }

  const fileInput = createElement('input', {
    type: 'file',
    accept: 'image/jpeg,image/png,image/webp',
    style: 'display:none',
    id: 'photo-upload-input',
  });
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file && onUploadPhoto) onUploadPhoto(file);
  });
  photoInfo.appendChild(fileInput);

  const uploadBtn = addActionButton(
    () => fileInput.click(),
    photoUrl ? 'Změnit fotku' : 'Nahrát fotku',
    'button--secondary btn-sm',
  );
  photoInfo.appendChild(uploadBtn);
  photoSection.appendChild(photoInfo);
  container.appendChild(photoSection);

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
    const recentPayments = historyPayments.slice(0, 3);

    recentPayments.forEach((p) => {
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

    if (historyPayments.length > 3 && onGoToPayments) {
      container.appendChild(addActionButton(onGoToPayments, 'Zobrazit více plateb →', 'button--secondary mt-5'));
    }
  }

  return container;
}
