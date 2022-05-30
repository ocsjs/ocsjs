
import { useContext } from '../store';
import { AlertType } from './alert';

export function message(type: AlertType['type'], text: string) {
  const { common } = useContext();
  if (common.alerts.length > 3) {
    common.alerts.shift();
  }
  common.alerts.push({ type, text, key: common.alerts.length });
}
