import * as CONST from '../../constants.js';
import * as STATUS from '../../statuses.js';
import { pathnameToAction } from '../router.js';

export async function loginAction({ store, api, payload, dispatch }) {
  store.setState((state) => ({
    ...state,
    ui: { ...state.ui, status: STATUS.LOAD, errorMessage: null },
  }));

  try {
    const data = await api.auth.login(payload.email, payload.password);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('memberId', data.member_id);
    localStorage.setItem('memberName', data.name);
    localStorage.setItem('memberSurname', data.surname);
    localStorage.setItem('memberRole', data.role);

    store.setState((state) => ({
      ...state,
      auth: {
        memberId: data.member_id,
        name: data.name,
        surname: data.surname,
        role: data.role,
      },
    }));
    
    // Nyní spustíme APP_INIT k načtení dat
    dispatch({ type: 'APP_INIT' }).then(() => {
        const action = pathnameToAction(window.location.pathname);
        if (action !== CONST.ENTER_RESERVATION_LIST) {
            dispatch({ type: action });
        }
    });

  } catch (error) {
    store.setState((state) => ({
      ...state,
      ui: { ...state.ui, status: STATUS.ERR, errorMessage: error.message ?? 'Nepodařilo se přihlásit' },
    }));
  }
}

export async function registerAction({ store, api, payload, dispatch }) {
    store.setState((state) => ({
      ...state,
      ui: { ...state.ui, status: STATUS.LOAD, errorMessage: null },
    }));
  
    try {
      const data = await api.auth.register(payload);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('memberId', data.member_id);
      localStorage.setItem('memberName', data.name);
      localStorage.setItem('memberSurname', data.surname);
      localStorage.setItem('memberRole', data.role);

      store.setState((state) => ({
        ...state,
        auth: {
          memberId: data.member_id,
          name: data.name,
          surname: data.surname,
          role: data.role,
        },
      }));
      
      // Spustíme inicializaci
      dispatch({ type: 'APP_INIT' }).then(() => {
          dispatch({ type: CONST.ENTER_RESERVATION_LIST });
      });
  
    } catch (error) {
      store.setState((state) => ({
        ...state,
        ui: { ...state.ui, status: STATUS.ERR, errorMessage: error.message ?? 'Nepodařilo se zaregistrovat' },
      }));
    }
}
