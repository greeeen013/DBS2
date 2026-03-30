// Komponenty pro tlačítka – přejato ze vzorového projektu prepare/.

import { createElement } from '../createElement.js';

export function createButton(classes, buttonText = '', options = {}) {
  return createElement('button', { className: 'button ' + classes, ...options }, [buttonText]);
}

export function addActionButton(action, text, classes) {
  const btn = createButton(classes, text);
  btn.addEventListener('click', action);
  return btn;
}

export function addButton(canCondition, onCondition, action, text, classes) {
  if (canCondition && onCondition) {
    const btn = createButton(classes, text);
    btn.addEventListener('click', action);
    return btn;
  }
  return '';
}
