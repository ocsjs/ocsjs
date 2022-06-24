import { useStore } from '../store';
import { AlertType } from './types';

export function message(type: AlertType['type'], text: string) {
	const local = useStore('localStorage');
	if (local.alerts.length > 3) {
		local.alerts.shift();
	}
	local.alerts.push({ type, text, key: local.alerts.length });
}
