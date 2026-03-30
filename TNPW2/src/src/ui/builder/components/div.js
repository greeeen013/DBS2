import { createElement } from '../createElement.js';

export function createDiv(classes = '', children = [], options = {}) {
  return createElement('div', { className: classes, ...options }, children);
}
