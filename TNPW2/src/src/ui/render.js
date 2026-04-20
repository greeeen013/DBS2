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
import { AdminView } from './views/AdminView.js';
import { LessonListView } from './views/LessonListView.js';
import { LessonCreationView } from './views/LessonCreationView.js';
import { createSuccessNotification, createErrorNotification } from './builder/layout/notification.js';
import { createSection } from './builder/components/section.js';
import { createElement } from './builder/createElement.js';
import { addActionButton } from './builder/components/button.js';
import { createHandlers } from '../app/actionHandlers/createHandlers.js';
import * as CONST from '../constants.js';
import * as STATUS from '../statuses.js';

function createUserHeader(auth, dispatch) {
  const nav = createElement('nav', { className: 'navbar navbar-dark bg-dark px-3 py-2' });
  const inner = createElement('div', { className: 'd-flex flex-column align-items-end ms-auto' });

  const fullName = [auth.name, auth.surname].filter(Boolean).join(' ');
  const nameSpan = createElement('span', { className: 'text-white fw-semibold' }, [fullName]);
  inner.appendChild(nameSpan);

  if (auth.role === 'admin') {
    const adminBadge = createElement('span', { className: 'badge bg-warning text-dark mt-1' }, ['Admin']);
    inner.appendChild(adminBadge);
    const btnAdmin = addActionButton(
      () => dispatch({ type: CONST.ENTER_ADMIN_VIEW }),
      'Správa plateb',
      'button--warning btn-sm mt-1',
    );
    inner.appendChild(btnAdmin);
  }

  const btnLogout = addActionButton(
    () => dispatch({ type: CONST.LOGOUT }),
    'Odhlásit',
    'button--danger btn-sm mt-1',
  );
  inner.appendChild(btnLogout);

  nav.appendChild(inner);
  return nav;
}

export function render(root, state, dispatch) {
  root.replaceChildren();

  const viewState = selectViewState(state);

  const handlers = createHandlers(dispatch, viewState);

  // Uživatelská lišta – zobrazí se na všech pohledech kromě přihlašovací stránky
  if (state.auth.memberId && viewState.type !== CONST.AUTH_VIEW) {
    root.appendChild(createUserHeader(state.auth, dispatch));
  }

  let view;
  switch (viewState.type) {
    case 'LOADING':
      view = LoadingView();
      break;

    case 'ERROR':
      view = ErrorView({
        message: viewState.message,
        handlers,
      });
      break;

    case CONST.RESERVATION_LIST:
      // handlers obsahuje onGoToPayments, onGoToLessons, reservationHandlers
      view = ReservationListView({ viewState, handlers });
      break;

    case CONST.PAYMENT_VIEW:
      view = PaymentView({ viewState, handlers });
      break;

    case CONST.LESSON_LIST:
      //handlers obsahuje onCreateLesson, onGoToReservations, lessonHandlers[]
      view = LessonListView({ viewState, handlers });
      break;

    case CONST.LESSON_CREATION_VIEW:
      // handlers obsahuje onSubmit, onCancel
      view = LessonCreationView({ viewState, handlers });
      break;

    case CONST.PROFILE_VIEW:
      view = ProfileView({ viewState, handlers });
      break;

    case CONST.ADMIN_VIEW:
      view = AdminView({ viewState, handlers });
      break;

    case CONST.AUTH_VIEW:
      renderAuthView(root, state, handlers);
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
