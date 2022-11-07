import { getConfig, setConfig } from '../utils/common';
import { el, tooltip } from '../utils/dom';

import { ConfigTagMap } from './configs/interface';
import { IElement } from './interface';

export class ConfigElement<T extends keyof ConfigTagMap = keyof ConfigTagMap> extends IElement {
	label: HTMLLabelElement = el('label');
	key: string = '';
	tag?: T;
	provider!: ConfigTagMap[T];
	/** 将本地修改后的值同步到元素中 */
	sync?: boolean;
	attrs?: Partial<ConfigTagMap[T]>;
	_onload?: (this: ConfigTagMap[T]) => void;

	get value() {
		return getConfig(this.key);
	}

	connectedCallback() {
		switch (this.tag) {
			case 'input': {
				this.provider = el('input') as any;
				break;
			}
			case 'select': {
				this.provider = el('select') as any;
				break;
			}
			case 'textarea': {
				this.provider = el('textarea') as any;
				break;
			}
			default: {
				this.provider = el('input') as any;
				break;
			}
		}

		const wrapper = el('div', { className: 'config-wrapper' });
		wrapper.append(this.provider);
		this.append(this.label, wrapper);

		this.provider.value = getConfig(this.key);

		for (const key in this.attrs) {
			if (Object.prototype.hasOwnProperty.call(this.attrs, key)) {
				Reflect.set(this.provider, key, Reflect.get(this.attrs, key));
			}
		}

		// 储存值
		this.provider.onchange = () => {
			// eslint-disable-next-line no-undef
			setConfig(this.key, this.provider.value);
		};

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
		this._onload?.apply(this.provider);
	}
}
