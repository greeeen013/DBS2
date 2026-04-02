import { createElement } from '../createElement.js';

export function createTitle(level, text, classes = '') {
  return createElement('h' + level, { className: classes }, [text]);
}
