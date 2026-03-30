import { createElement } from '../createElement.js';

export function createSection(classes = '', children = []) {
  return createElement('section', { className: classes }, children);
}
