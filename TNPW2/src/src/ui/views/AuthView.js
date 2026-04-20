import * as CONST from '../../constants.js';
import { createElement } from '../builder/createElement.js';

export function renderAuthView(root, state, handlers) {
  root.replaceChildren();
  const { onLogin, onRegister } = handlers;

  const container = createElement('div', { className: 'container mt-5' });

  const heading = createElement('h1', { className: 'mb-4' }, ['Přihlášení / Registrace']);
  container.appendChild(heading);

  const row = createElement('div', { className: 'row' });

  // --- LOGIN FORM ---
  const colLogin = createElement('div', { className: 'col-md-6 mb-4' });
  const loginCard = createElement('div', { className: 'card card-body' });
  
  const loginTitle = createElement('h3', {}, ['Přihlášení']);
  const loginForm = createElement('form', { id: 'login-form' });

  const loginEmailDiv = createElement('div', { className: 'mb-3' });
  loginEmailDiv.appendChild(createElement('label', { className: 'form-label' }, ['E-mail']));
  const loginEmailInput = createElement('input', { type: 'email', className: 'form-control', id: 'login-email', required: 'true' });
  loginEmailDiv.appendChild(loginEmailInput);

  const loginPassDiv = createElement('div', { className: 'mb-3' });
  loginPassDiv.appendChild(createElement('label', { className: 'form-label' }, ['Heslo']));
  const loginPassInput = createElement('input', { type: 'password', className: 'form-control', id: 'login-password', required: 'true' });
  loginPassDiv.appendChild(loginPassInput);

  const loginBtn = createElement('button', { className: 'btn btn-primary', type: 'submit' }, ['Přihlásit']);
  
  loginForm.appendChild(loginEmailDiv);
  loginForm.appendChild(loginPassDiv);
  loginForm.appendChild(loginBtn);
  
  loginCard.appendChild(loginTitle);
  loginCard.appendChild(loginForm);
  colLogin.appendChild(loginCard);
  row.appendChild(colLogin);

  // --- REGISTER FORM ---
  const colRegister = createElement('div', { className: 'col-md-6 mb-4' });
  const registerCard = createElement('div', { className: 'card card-body' });
  
  const regTitle = createElement('h3', {}, ['Registrace']);
  const regForm = createElement('form', { id: 'register-form' });

  const regNameDiv = createElement('div', { className: 'mb-3' });
  regNameDiv.appendChild(createElement('label', { className: 'form-label' }, ['Jméno']));
  const regNameInput = createElement('input', { type: 'text', className: 'form-control', id: 'reg-name', required: 'true' });
  regNameDiv.appendChild(regNameInput);

  const regSurnameDiv = createElement('div', { className: 'mb-3' });
  regSurnameDiv.appendChild(createElement('label', { className: 'form-label' }, ['Příjmení']));
  const regSurnameInput = createElement('input', { type: 'text', className: 'form-control', id: 'reg-surname', required: 'true' });
  regSurnameDiv.appendChild(regSurnameInput);

  const regEmailDiv = createElement('div', { className: 'mb-3' });
  regEmailDiv.appendChild(createElement('label', { className: 'form-label' }, ['E-mail']));
  const regEmailInput = createElement('input', { type: 'email', className: 'form-control', id: 'reg-email', required: 'true' });
  regEmailDiv.appendChild(regEmailInput);

  const regPassDiv = createElement('div', { className: 'mb-3' });
  regPassDiv.appendChild(createElement('label', { className: 'form-label' }, ['Heslo']));
  const regPassInput = createElement('input', { type: 'password', className: 'form-control', id: 'reg-password', required: 'true' });
  regPassDiv.appendChild(regPassInput);

  const regBtn = createElement('button', { className: 'btn btn-success', type: 'submit' }, ['Zaregistrovat']);

  regForm.appendChild(regNameDiv);
  regForm.appendChild(regSurnameDiv);
  regForm.appendChild(regEmailDiv);
  regForm.appendChild(regPassDiv);
  regForm.appendChild(regBtn);

  registerCard.appendChild(regTitle);
  registerCard.appendChild(regForm);
  colRegister.appendChild(registerCard);
  row.appendChild(colRegister);

  container.appendChild(row);

  // Handlers
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (onLogin) {
      onLogin({ email: loginEmailInput.value, password: loginPassInput.value });
    }
  });

  regForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (onRegister) {
      onRegister({
        name: regNameInput.value,
        surname: regSurnameInput.value,
        email: regEmailInput.value,
        password: regPassInput.value
      });
    }
  });

  root.appendChild(container);
}
