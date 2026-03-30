// Pohled pro zobrazení chybového stavu aplikace – přejato ze vzorového projektu.
// Zobrazí chybovou zprávu a tlačítko pro návrat do normálního stavu.

export function ErrorView({ message, handlers }) {
  const { onContinue } = handlers;

  const root = document.createElement('div');

  const h1 = document.createElement('h1');
  h1.textContent = 'Chyba';

  const p = document.createElement('p');
  p.textContent = message;

  const button = document.createElement('button');
  button.textContent = 'Pokračovat';
  button.addEventListener('click', onContinue);

  root.appendChild(h1);
  root.appendChild(p);
  root.appendChild(button);
  return root;
}
