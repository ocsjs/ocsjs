import { $ } from '../utils/common';
import { el } from '../utils/dom';
import { $gm } from '../utils/tampermonkey';
import { IElement } from './interface';

/**
 * 弹窗元素
 */
export class ModalElement extends IElement {
	/** 弹窗简介 */
	profile?: string;

	/** 弹窗标题 */
	_title: HTMLDivElement = el('div', { className: 'modal-title' });
	/** 弹窗主体  */
	body: HTMLDivElement = el('div', { className: 'modal-body' });
	/** 弹窗底部 */
	footerContainer: HTMLDivElement = el('div', { className: 'modal-footer' });
	footer?: HTMLDivElement;
	/** 弹窗确认按钮 */
	confirmButton?: HTMLButtonElement | null;
	/** 弹窗取消按钮 */
	cancelButton?: HTMLButtonElement | null;
	/** 弹窗底部输入框 */
	modalInput: HTMLInputElement | HTMLTextAreaElement = el('input', { className: 'modal-input' });
	modalInputType?: 'input' | 'textarea' = 'input';
	/**
	 * 弹窗类型
	 * prompt : 询问弹窗，并带有输入框
	 * confirm : 确认弹窗，带有取消按钮
	 * alert : 默认弹窗，只有确认按钮
	 */
	type: 'prompt' | 'alert' | 'confirm' | 'simple' = 'alert';
	/** 弹窗内容 */
	content: string | HTMLElement | Node = '';
	/** 输入框默认内容 */
	inputDefaultValue?: string = '';
	/** 输入框提示 */
	placeholder?: string = '';
	/** 弹窗宽度 */
	width?: number;
	/** 取消按钮的文本 */
	cancelButtonText?: string;
	/** 确认按钮的文本 */
	confirmButtonText?: string;

	/** 弹窗元素样式 */
	modalStyle?: Partial<CSSStyleDeclaration> = {};

	/** 返回 false 则不会关闭模态框 */
	onConfirm?: (value?: string) => boolean | void | Promise<boolean | void>;
	/** 点击取消的回调 */
	onCancel?: () => void;
	/** 点击取消或者确认都会执行 */
	onClose?: (value?: string) => void;

	connectedCallback() {
		/**
		 * 通过 class 来区分弹窗类型
		 * prompt : 下方带有输入框
		 * confirm : 输入框将被隐藏
		 * alert : 取消框和输入框都将被隐藏
		 */
		this.classList.add(this.type);

		/**
		 * 合并样式
		 */
		Object.assign(this.style, this.modalStyle || {});

		// 弹窗来源
		const profile = el('div', {
			innerText: this.profile || '弹窗来自: OCS ' + ($gm.getInfos()?.script.version || ''),
			className: 'modal-profile'
		});

		// 标题
		this._title.innerText = this.title;
		// 模态框内容
		this.body.append(typeof this.content === 'string' ? el('div', { innerHTML: this.content }) : this.content);

		// 输入框
		if (this.modalInputType === 'textarea') {
			this.modalInput = el('textarea', { className: 'modal-input', style: { height: '100px' } });
		}
		this.modalInput.placeholder = this.placeholder || '';
		this.modalInput.value = this.inputDefaultValue || '';

		// 添加到模态框
		this.append(profile, this._title, this.body, this.footerContainer);
		// 设置模态框宽度
		this.style.width = (this.width || 400) + 'px';
		// 底部

		// 如果没有自定义底部，则按照类型来添加
		if (this.footer === undefined) {
			this.footerContainer.append(this.modalInput);
			if (this.cancelButton === undefined) {
				this.cancelButton = el('button', { className: 'modal-cancel-button' });
				this.cancelButton.innerText = this.cancelButtonText || '取消';
				this.cancelButton.onclick = () => {
					this.onCancel?.();
					this.onClose?.();
					this.remove();
				};
			}
			if (this.confirmButton === undefined) {
				this.confirmButton = el('button', { className: 'modal-confirm-button' });
				this.confirmButton.innerText = this.confirmButtonText || '确定';
				this.confirmButton.onclick = async () => {
					if ((await this.onConfirm?.(this.modalInput.value)) !== false) {
						this.remove();
						this.onClose?.(this.modalInput.value);
					}
				};
			}

			this.cancelButton && this.footerContainer.append(this.cancelButton);
			this.confirmButton && this.footerContainer.append(this.confirmButton);

			if (this.type === 'simple') {
				this.footerContainer.remove();
			} else if (this.type === 'prompt') {
				this.modalInput.focus();
			}
		} else {
			this.footerContainer.append(this.footer);
		}

		$.onresize(this.body, (modal) => {
			this.body.style.maxHeight = window.innerHeight - 100 + 'px';
			this.body.style.maxWidth = window.innerWidth - 50 + 'px';
		});
	}
}
