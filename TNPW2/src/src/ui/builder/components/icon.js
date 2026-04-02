import { createElement } from '../createElement.js';

export function createIcon(classes) {
  return createElement('i', { className: classes }, []);
}
