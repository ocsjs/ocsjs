import { $creator } from '../utils/creator';
import { el } from '../utils/dom';
import { $gm } from '../utils/tampermonkey';

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
	_onload?: (this: ConfigTagMap[T], el: this) => void;

	get value() {
		return $gm.getValue(this.key);
	}

	connectedCallback() {
		const createInput = () => {
			this.provider = el('input');
			if (['checkbox', 'radio'].some((t) => t === this.attrs?.type)) {
				this.provider.checked = $gm.getValue(this.key, false);
				const provider = this.provider;
				provider.onchange = () => {
					$gm.setValue(this.key, provider.checked);
				};
			} else {
				this.provider.value = $gm.getValue(this.key, '');
				this.provider.setAttribute('value', this.provider.value);

				this.provider.onchange = () => {
					const { min, max, type } = (this.attrs || {}) as Partial<ConfigTagMap['input']>;
					if (type === 'number') {
						if (min && this.provider.value < min) {
							this.provider.value = min;
						} else if (max && this.provider.value > max) {
							this.provider.value = max;
						} else {
							$gm.setValue(this.key, this.provider.value);
						}
					} else {
						$gm.setValue(this.key, this.provider.value);
					}
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
				// select 表情不能直接设置 value ，需要根据子元素 selected
				this.provider.setAttribute('value', $gm.getValue(this.key));
				this.provider.onchange = () => {
					$gm.setValue(this.key, this.provider.value);
				};
				break;
			}
			case 'textarea': {
				this.provider = el('textarea');
				this.provider.value = $gm.getValue(this.key, '');
				this.provider.onchange = () => {
					$gm.setValue(this.key, this.provider.value);
				};
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
			$gm.addConfigChangeListener(this.key, (pre, curr, remote) => {
				this.provider.value = curr;
			});
		}

		// 处理提示
		$creator.tooltip(this.provider);

		/**
		 * 触发输入组件的加载回调
		 * 可用于高度定制化组件
		 */
		this._onload?.call(this.provider as any, this);
	}
}
