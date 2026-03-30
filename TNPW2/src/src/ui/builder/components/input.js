import { createElement } from '../createElement.js';

export function createInput(classes = '', options = {}) {
  return createElement('label', '', [
    createElement('input', { className: classes, ...options }, []),
  ]);
}
