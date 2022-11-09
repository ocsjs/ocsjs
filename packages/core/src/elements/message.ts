import { el } from '../utils/dom';
import { IElement } from './interface';

export class MessageElement extends IElement {
	closer: HTMLSpanElement = el('span', { className: 'message-closer' }, 'x');
	contentContainer: HTMLSpanElement = el('span', { className: 'message-content-container' });

	type: 'info' | 'success' | 'warn' | 'error' = 'info';
	content: string | HTMLElement = '';
	/** 持续时间，如果为0的话则一直存在 */
	duration: number = 5;
	closeable?: boolean = true;
	onClose?: () => void;

	connectedCallback() {
		this.classList.add(this.type);
		this.contentContainer.append(this.content);
		this.duration = Math.max(this.duration, 0);
		this.append(this.contentContainer);

		if (this.closeable) {
			this.append(this.closer);
			this.closer.addEventListener('click', () => {
				this.onClose?.();
				this.remove();
			});
		}

		if (this.duration) {
			setTimeout(() => {
				this.onClose?.();
				this.remove();
			}, this.duration * 1000);
		}
	}
}
