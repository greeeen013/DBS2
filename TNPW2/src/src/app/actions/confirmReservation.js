// Akce: potvrzení rezervace.
//
// Klíčový příklad sledování loading/error stavů asynchronní komunikace:
// 1. Před odesláním požadavku nastavím status = LOADING (render zobrazí LoadingView)
// 2. Po úspěchu aktualizuji rezervaci a kreditový zůstatek v store
// 3. Při chybě (typicky "Nedostatek kreditů") zobrazím notifikaci
//
// Tento vzor platí pro všechny akce komunikující s backendem.

import * as STATUS from '../../statuses.js';

export async function confirmReservation({ store, api, payload }) {
  const { reservationId } = payload;

  // Nastavení loading stavu – uživatel uvidí spinner/text "Načítání…"
  store.setState((state) => ({
    ...state,
    ui: { ...state.ui, status: STATUS.LOAD, notification: null },
  }));

  try {
    const result = await api.reservations.updateStatus(reservationId, 'CONFIRMED');

    // Aktualizace rezervace v seznamu a nový kreditový zůstatek
    store.setState((state) => ({
      ...state,
      reservations: state.reservations.map((r) =>
        r.reservation_id === result.reservation_id ? result : r,
      ),
      creditBalance: result.credit_balance ?? state.creditBalance,
      ui: {
        ...state.ui,
        status: STATUS.RDY,
        notification: { type: STATUS.OK, message: 'Rezervace byla úspěšně potvrzena.' },
      },
    }));
  } catch (error) {
    // Backend vrátí "Nedostatek kreditů" – zobrazíme srozumitelnou zprávu
    const zprava = error.message.toLowerCase().includes('kredit')
      ? 'Nemáte dostatek kreditů pro potvrzení rezervace.'
      : error.message;

    store.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        status: STATUS.RDY,
        notification: { type: STATUS.WAR, message: zprava },
      },
    }));
  }
}
