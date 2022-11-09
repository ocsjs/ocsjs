import { el, tooltip } from '../utils/dom';
import { getValue, setValue } from '../utils/tampermonkey';

import { ConfigTagMap } from './configs/interface';
import { IElement } from './interface';

export class ConfigElement<T extends keyof ConfigTagMap = 'input'> extends IElement {
	label: HTMLLabelElement = el('label');
	wrapper: HTMLDivElement = el('div', { className: 'config-wrapper' });
	key: string = '';
	tag?: T;
	provider!: ConfigTagMap[keyof ConfigTagMap];
	/** 将本地修改后的值同步到元素中 */
	sync?: boolean;
	attrs?: Partial<ConfigTagMap[T]>;
	_onload?: (this: ConfigTagMap[T]) => void;

	get value() {
		return getValue(this.key);
	}

	connectedCallback() {
		const createInput = () => {
			this.provider = el('input');
			if (['checkbox', 'radio'].some((t) => t === this.attrs?.type)) {
				this.provider.checked = getValue(this.key);
				const provider = this.provider;
				provider.onchange = () => {
					setValue(this.key, provider.checked);
				};
			} else {
				this.provider.value = getValue(this.key);
				this.provider.onchange = () => {
					setValue(this.key, this.provider.value);
				};
			}
		};
		switch (this.tag) {
			case 'input': {
				createInput();
				break;
			}
			case 'select': {
				this.provider = el('select');
				this.provider.value = getValue(this.key);
				break;
			}
			case 'textarea': {
				this.provider = el('textarea');
				this.provider.value = getValue(this.key);
				break;
			}
			default: {
				createInput();
				break;
			}
		}

		this.wrapper.replaceChildren(this.provider);
		this.append(this.label, this.wrapper);

		for (const key in this.attrs) {
			if (Object.prototype.hasOwnProperty.call(this.attrs, key)) {
				Reflect.set(this.provider, key, Reflect.get(this.attrs, key));
			}
		}

		// 处理跨域
		if (this.sync) {
			// eslint-disable-next-line no-undef
			GM_addValueChangeListener(this.key, (key, pre, curr, remote) => {
				this.provider.value = curr;
			});
		}

		// 处理提示
		tooltip(this.provider);

		/**
		 * 触发输入组件的加载回调
		 * 可用于高度定制化组件
		 */
		this._onload?.apply(this.provider as any);
	}
}
