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
	confirmButton?: HTMLButtonElement;
	cancelButton?: HTMLButtonElement;
	modalInput: HTMLInputElement = el('input', { className: 'model-input' });

	type: 'prompt' | 'alert' | 'confirm' = 'alert';
	content: string | HTMLElement = '';
	placeholder?: string = '';
	width?: number;
	cancelButtonText?: string;
	confirmButtonText?: string;
	onConfirm?: (value?: string) => void;
	onCancel?: () => void;
	onClose?: (value?: string) => void;

	connectedCallback() {
		this.classList.add(this.type);
		this.modalTitle.innerText = this.title;
		this.modalBody.append(typeof this.content === 'string' ? el('div', { innerHTML: this.content }) : this.content);

		this.modalInput.placeholder = this.placeholder || '';
		this.modalFooter.append(this.modalInput);
		this.append(this.modelProfile, this.modalTitle, this.modalBody, this.modalFooter);
		this.style.width = (this.width || 400) + 'px';
		if (!this.cancelButton) {
			this.cancelButton = el('button', { className: 'model-cancel-button' });
			this.cancelButton.innerText = this.cancelButtonText || '取消';
			this.cancelButton.addEventListener('click', () => {
				this.onCancel?.();
				this.onClose?.();
				this.remove();
			});
		}
		if (!this.confirmButton) {
			this.confirmButton = el('button', { className: 'model-confirm-button' });
			this.confirmButton.innerText = this.confirmButtonText || '确定';
			this.confirmButton.addEventListener('click', () => {
				this.onConfirm?.(this.modalInput.value);
				this.onClose?.(this.modalInput.value);
				this.remove();
			});
		}
		this.modalFooter.append(this.cancelButton);
		this.modalFooter.append(this.confirmButton);
	}
}
