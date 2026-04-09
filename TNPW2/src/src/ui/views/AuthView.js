import * as CONST from '../../constants.js';

export function renderAuthView(root, state, dispatch) {
  root.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'container mt-5';

  const heading = document.createElement('h1');
  heading.className = 'mb-4';
  heading.textContent = 'Přihlášení / Registrace';
  container.appendChild(heading);

  const row = document.createElement('div');
  row.className = 'row';

  // --- LOGIN FORM ---
  const colLogin = document.createElement('div');
  colLogin.className = 'col-md-6 mb-4';
  
  const loginCard = document.createElement('div');
  loginCard.className = 'card card-body';
  loginCard.innerHTML = `
    <h3>Přihlášení</h3>
    <form id="login-form">
      <div class="mb-3">
        <label class="form-label">E-mail</label>
        <input type="email" class="form-control" id="login-email" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Heslo</label>
        <input type="password" class="form-control" id="login-password" required />
      </div>
      <button class="btn btn-primary" type="submit">Přihlásit</button>
    </form>
  `;
  colLogin.appendChild(loginCard);
  row.appendChild(colLogin);

  // --- REGISTER FORM ---
  const colRegister = document.createElement('div');
  colRegister.className = 'col-md-6 mb-4';

  const registerCard = document.createElement('div');
  registerCard.className = 'card card-body';
  registerCard.innerHTML = `
    <h3>Registrace</h3>
    <form id="register-form">
      <div class="mb-3">
        <label class="form-label">Jméno</label>
        <input type="text" class="form-control" id="reg-name" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Příjmení</label>
        <input type="text" class="form-control" id="reg-surname" required />
      </div>
      <div class="mb-3">
        <label class="form-label">E-mail</label>
        <input type="email" class="form-control" id="reg-email" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Heslo</label>
        <input type="password" class="form-control" id="reg-password" required />
      </div>
      <button class="btn btn-success" type="submit">Zaregistrovat</button>
    </form>
  `;
  colRegister.appendChild(registerCard);
  row.appendChild(colRegister);

  container.appendChild(row);

  // Handlers
  loginCard.querySelector('#login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    dispatch({ type: CONST.LOGIN, payload: { email, password } });
  });

  registerCard.querySelector('#register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const surname = document.getElementById('reg-surname').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    dispatch({ type: CONST.REGISTER, payload: { name, surname, email, password } });
  });

  root.appendChild(container);
}
