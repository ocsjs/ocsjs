import { getConfig, setConfig } from '../utils/common';
import { el } from '../utils/dom';

import { ConfigTagMap } from './configs/interface';
import { IElement } from './interface';

export class ConfigElement extends IElement {
	label: HTMLElement = el('div');
	key: string = '';
	tag?: keyof ConfigTagMap;
	provider: ConfigTagMap[keyof ConfigTagMap] = el('input');
	attrs?: Partial<ConfigTagMap[keyof ConfigTagMap]>;
	/** 跨域设置 */
	cors?: boolean;

	connectedCallback() {
		switch (this.tag) {
			case 'input': {
				this.provider = el('input');
				break;
			}
			case 'select': {
				this.provider = el('select');
				break;
			}
			case 'textarea': {
				this.provider = el('textarea');
				break;
			}
			default: {
				this.provider = el('input');
				break;
			}
		}
		this.append(this.label, this.provider);

		this.provider.value = getConfig(this.key, '');

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
		if (this.cors) {
			// eslint-disable-next-line no-undef
			GM_addValueChangeListener(this.key, (key, pre, curr, remote) => {
				if (remote) {
					this.provider.value = curr;
				}
			});
		}
	}
}
