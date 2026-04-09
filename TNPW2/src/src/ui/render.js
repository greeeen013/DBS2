// Hlavní render funkce – přejato a upraveno ze vzoru prepare/render.js.
//
// Při každé změně stavu vymaže DOM a znovu vykreslí odpovídající pohled.
// Notifikace (toast zprávy) se zobrazí na konci každého renderu.

import { selectViewState } from '../infra/store/selectors.js';
import { LoadingView } from './views/LoadingView.js';
import { ErrorView } from './views/ErrorView.js';
import { ReservationListView } from './views/ReservationListView.js';
import { PaymentView } from './views/PaymentView.js';
import { ProfileView } from './views/ProfileView.js';
import { renderAuthView } from './views/AuthView.js';
import { createSuccessNotification, createErrorNotification } from './builder/layout/notification.js';
import { createSection } from './builder/components/section.js';
import { createElement } from './builder/createElement.js';
import { addActionButton } from './builder/components/button.js';
import * as CONST from '../constants.js';
import * as STATUS from '../statuses.js';

function createUserHeader(name, dispatch) {
  const nav = createElement('nav', { className: 'navbar navbar-dark bg-dark px-3 py-2' });
  const inner = createElement('div', { className: 'd-flex align-items-center ms-auto gap-3' });
  const nameSpan = createElement('span', { className: 'text-white fw-semibold' }, [name ?? '']);
  const btnLogout = addActionButton(
    () => dispatch({ type: CONST.LOGOUT }),
    'Odhlásit',
    'button--danger btn-sm',
  );
  inner.appendChild(nameSpan);
  inner.appendChild(btnLogout);
  nav.appendChild(inner);
  return nav;
}

export function render(root, state, dispatch) {
  root.replaceChildren();

  const viewState = selectViewState(state);

  // Uživatelská lišta – zobrazí se na všech pohledech kromě přihlašovací stránky
  if (state.auth.memberId && viewState.type !== CONST.AUTH_VIEW) {
    root.appendChild(createUserHeader(state.auth.name, dispatch));
  }

  let view;
  switch (viewState.type) {
    case 'LOADING':
      view = LoadingView();
      break;

    case 'ERROR':
      view = ErrorView({
        message: viewState.message,
        handlers: {
          onContinue: () => dispatch({ type: CONST.RECOVER_FROM_ERROR }),
        },
      });
      break;

    case CONST.RESERVATION_LIST:
      view = ReservationListView({ viewState, dispatch });
      break;

    case CONST.PAYMENT_VIEW:
      view = PaymentView({ viewState, dispatch });
      break;

    case CONST.PROFILE_VIEW:
      view = ProfileView({ viewState, dispatch });
      break;
    
    case CONST.AUTH_VIEW:
      renderAuthView(root, state, dispatch);
      // Notifikace pro auth view (renderAuthView dělá root.appendChild uvnitř pro AuthView container)
      // Takže view nepotřebujeme nastavovat
      break;

    default:
      view = document.createTextNode(`Neznámý pohled: ${viewState.type}`);
  }

  if (view) {
    root.appendChild(view);
  }

  // Notifikace – zobrazí se na konci každého pohledu (jako v prepare/render.js)
  const { notification } = state.ui;
  const messages = createSection('notification');

  if (notification?.message) {
    const type = notification.type ?? '';
    if (type === STATUS.OK) {
      messages.appendChild(createSuccessNotification({ message: notification.message }));
    } else if (type === STATUS.ERR || type === STATUS.WAR) {
      messages.appendChild(createErrorNotification({ message: notification.message }));
    } else {
      messages.appendChild(createSuccessNotification({ message: notification.message }));
    }
    // Vymazání notifikace přes dispatch na dalším tiku – zabrání rekurzivnímu renderu.
    setTimeout(() => dispatch({ type: CONST.CLEAR_NOTIFICATION }), 0);
  }

  root.appendChild(messages);
}
