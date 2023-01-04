import { el } from '../utils/dom';
import { getInfos } from '../utils/tampermonkey';
import { IElement } from './interface';

export class ModelElement extends IElement {
	modelProfile: HTMLDivElement = el('div', {
		innerText: '弹窗来自: OCS-' + getInfos().script.version,
		className: 'model-profile'
	});

	modalTitle: HTMLDivElement = el('div', { className: 'model-title' });
	modalBody: HTMLDivElement = el('div', { className: 'model-body' });
	modalFooter: HTMLDivElement = el('div', { className: 'model-footer' });
	confirmButton?: HTMLButtonElement | null;
	cancelButton?: HTMLButtonElement | null;
	modalInput: HTMLInputElement = el('input', { className: 'model-input' });

	type: 'prompt' | 'alert' | 'confirm' = 'alert';
	content: string | HTMLElement = '';
	inputDefaultValue?: string = '';
	placeholder?: string = '';
	width?: number;
	cancelButtonText?: string;
	confirmButtonText?: string;
	/** 返回 false 则不会关闭模态框 */
	onConfirm?: (value?: string) => boolean | void | Promise<boolean | void>;
	onCancel?: () => void;
	onClose?: (value?: string) => void;

	connectedCallback() {
		this.classList.add(this.type);
		// 标题
		this.modalTitle.innerText = this.title;
		// 模态框内容
		this.modalBody.append(typeof this.content === 'string' ? el('div', { innerHTML: this.content }) : this.content);

		// 输入框
		this.modalInput.placeholder = this.placeholder || '';
		this.modalInput.value = this.inputDefaultValue || '';

		// 底部
		this.modalFooter.append(this.modalInput);
		this.append(this.modelProfile, this.modalTitle, this.modalBody, this.modalFooter);
		this.style.width = (this.width || 400) + 'px';
		if (this.cancelButton === undefined) {
			this.cancelButton = el('button', { className: 'model-cancel-button' });
			this.cancelButton.innerText = this.cancelButtonText || '取消';
			this.cancelButton.addEventListener('click', () => {
				this.onCancel?.();
				this.onClose?.();
				this.remove();
			});
		}
		if (this.confirmButton === undefined) {
			this.confirmButton = el('button', { className: 'model-confirm-button' });
			this.confirmButton.innerText = this.confirmButtonText || '确定';
			this.confirmButton.addEventListener('click', async () => {
				if ((await this.onConfirm?.(this.modalInput.value)) !== false) {
					this.remove();
					this.onClose?.(this.modalInput.value);
				}
			});
		}

		this.cancelButton !== null && this.modalFooter.append(this.cancelButton);
		this.confirmButton !== null && this.modalFooter.append(this.confirmButton);

		const resize = () => {
			this.style.maxHeight = window.innerHeight - 100 + 'px';
			this.style.maxWidth = window.innerWidth - 50 + 'px';
		};
		resize();
		window.addEventListener('resize', resize);
	}
}
