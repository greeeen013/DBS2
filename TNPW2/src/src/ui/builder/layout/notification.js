// Komponenty pro notifikační zprávy – přejato ze vzorového projektu prepare/.
// Zobrazují se ve spodní části každého pohledu jako Bootstrap alerty.

import { createDiv } from '../components/div.js';
import { createIcon } from '../components/icon.js';

export function createSuccessNotification({ message }) {
  const icon = createIcon('start-icon fa fa-info-circle');
  return createDiv('alert alert-simple alert-info', [icon, message]);
}

export function createErrorNotification({ message }) {
  const icon = createIcon('start-icon far fa-times-circle');
  return createDiv('alert alert-simple alert-danger', [icon, message]);
}
