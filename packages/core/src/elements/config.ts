import { el } from '../utils/dom';
import { ConfigTagMap } from './configs/interface';
import { IElement } from './interface';

export class ConfigElement extends IElement {
	label: HTMLElement;
	type?: keyof ConfigTagMap;
	provider: ConfigTagMap[keyof ConfigTagMap];
	key?: string;
	/** 跨域设置 */
	cors?: boolean;
	constructor() {
		super();

		this.label = el('div');

		switch (this.type) {
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
	}

	connectedCallback() {
		// 储存值
		this.provider.onchange = () => {
			if (this.key) {
				// eslint-disable-next-line no-undef
				GM_setValue(this.key, this.provider.value);
			}
		};

		// 处理跨域
		if (this.cors && this.key) {
			// eslint-disable-next-line no-undef
			GM_addValueChangeListener(this.key, (key, pre, curr, remote) => {
				if (remote) {
					this.provider.value = curr;
				}
			});
		}
	}
}
