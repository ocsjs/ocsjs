import { store } from '../main';
import { AlertType } from './alert';

export function message(type: AlertType['type'], text: string) {
  if (store.alerts.length > 3) {
    store.alerts.shift();
  }

  store.alerts.push({ type, text, key: store.alerts.length });
}
