// Pohled zobrazený během asynchronních operací – přejato ze vzorového projektu.
// Jednoduchý "Načítání..." text; v reálné aplikaci by bylo možné přidat spinner.

export function LoadingView() {
  const root = document.createElement('div');
  const h1 = document.createElement('h1');
  h1.textContent = 'Načítání…';
  root.appendChild(h1);
  return root;
}
