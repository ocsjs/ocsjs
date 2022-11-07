import { el } from '../utils/dom';
import { IElement } from './interface';

export class ModelElement extends IElement {
	modelProfile: HTMLDivElement = el('div', {
		innerText: '弹窗来自: OCS-' + process.env.__VERSION__,
		className: 'model-profile'
	});

	modalTitle: HTMLDivElement = el('div', { className: 'model-title' });
	modalBody: HTMLDivElement = el('div', { className: 'model-body' });
	modalFooter: HTMLDivElement = el('div', { className: 'model-footer' });
	confirmButton: HTMLButtonElement = el('button', { className: 'model-confirm-button' });
	cancelButton: HTMLButtonElement = el('button', { className: 'model-cancel-button' });
	modalInput: HTMLInputElement = el('input', { className: 'model-input' });

	type: 'prompt' | 'alert' | 'confirm' = 'alert';
	content: string = '';
	placeholder?: string = '';
	cancelButtonText?: string;
	confirmButtonText?: string;
	onConfirm?: (value?: string) => void;
	onCancel?: () => void;

	connectedCallback() {
		this.classList.add(this.type);
		this.modalTitle.innerText = this.title;
		this.modalBody.innerText = this.content;
		this.cancelButton.innerText = this.cancelButtonText = '取消';
		this.confirmButton.innerText = this.confirmButtonText = '确定';
		this.modalInput.placeholder = this.placeholder || '';
		this.modalFooter.append(this.modalInput, this.cancelButton, this.confirmButton);
		this.append(this.modelProfile, this.modalTitle, this.modalBody, this.modalFooter);

		this.confirmButton.addEventListener('click', () => {
			this.onConfirm?.(this.modalInput.value);
			this.remove();
		});

		this.cancelButton.addEventListener('click', () => {
			this.onCancel?.();
			this.remove();
		});
	}
}
