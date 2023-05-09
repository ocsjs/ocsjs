import { el } from '../utils/dom';
import { IElement } from './interface';

/**
 * 消息元素
 */
export class MessageElement extends IElement {
	/** 关闭按钮 */
	closer: HTMLSpanElement = el('span', { className: 'message-closer' }, 'x');
	/** 内容外部元素 */
	contentContainer: HTMLSpanElement = el('span', { className: 'message-content-container' });
	/**  消息类型 */
	type: 'info' | 'success' | 'warn' | 'error' = 'info';
	/** 内容 */
	content: string | HTMLElement = '';
	/** 持续时间(秒)，如果为0的话则一直存在，默认为: 5 */
	duration?: number;
	/** 是否允许关闭 */
	closeable?: boolean = true;
	/** 关闭回调 */
	onClose?: () => void;

	connectedCallback() {
		this.classList.add(this.type);
		if (typeof this.content === 'string') {
			this.contentContainer.innerHTML = this.content;
		} else {
			this.contentContainer.append(this.content);
		}

		this.duration = Math.max(this.duration ?? 5, 0);
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
