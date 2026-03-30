import { createElement } from '../createElement.js';

export function createText(children = [], classes = '') {
  return createElement('p', { className: classes }, [children]);
}
