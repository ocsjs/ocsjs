import { $creator } from '../utils/creator';
import { el } from '../utils/dom';
import { $store } from '../utils/store';

import { ConfigTagMap } from './configs/interface';
import { IElement } from './interface';

/**
 * 配置表单元素
 *
 * 可以根据 {@link Script.configs} 在面板中生成设置表单，并对数据进行双向绑定。
 *
 */
export class ConfigElement<T extends keyof ConfigTagMap = 'input'> extends IElement {
	label: HTMLLabelElement = el('label');
	wrapper: HTMLDivElement = el('div', { className: 'config-wrapper' });
	key: string = '';
	tag?: T;
	defaultValue: any;
	provider!: ConfigTagMap[keyof ConfigTagMap];
	/** 将本地修改后的值同步到元素中 */
	sync?: boolean;
	/** 元素属性 */
	attrs?: Partial<ConfigTagMap[T]>;
	/** tag 为 select 时的选项 */
	options?: string[][] | { label: string; value: string; title?: string }[];
	_onload?: (this: ConfigTagMap[T], el: this) => void;

	get value() {
		return $store.get(this.key, this.defaultValue);
	}

	connectedCallback() {
		switch (this.tag) {
			case 'select': {
				this.provider = el('select');
				// select 表情不能直接设置 value ，需要根据子元素 selected
				const value = $store.get(this.key, this.defaultValue);

				// 创建选项
				for (const item of this.options || []) {
					const option = el('option');
					if (Array.isArray(item)) {
						option.value = item[0];
						option.textContent = item[1];
						if (item[2]) {
							option.title = item[2];
						}
						if (item[0] === value) {
							option.selected = true;
							option.toggleAttribute('selected');
						}
						this.provider.add(option);
					} else {
						option.value = item.value;
						option.textContent = item.label;
						if (item.title) {
							option.title = item.title;
						}
						if (item.value === value) {
							option.selected = true;
							option.toggleAttribute('selected');
						}
						this.provider.add(option);
					}
				}
				this.provider.onchange = () => {
					$store.set(this.key, this.provider.value);
				};
				break;
			}
			case 'textarea': {
				this.provider = el('textarea');
				this.provider.value = $store.get(this.key, this.defaultValue);
				this.provider.onchange = () => {
					$store.set(this.key, this.provider.value);
				};
				break;
			}
			default: {
				this.provider = el('input');
				if (['checkbox', 'radio'].some((t) => t === this.attrs?.type)) {
					this.provider.checked = $store.get(this.key, this.defaultValue);
					const provider = this.provider;
					provider.onchange = () => {
						$store.set(this.key, provider.checked);
					};
				} else {
					this.provider.value = $store.get(this.key, this.defaultValue);
					this.provider.setAttribute('value', this.provider.value);

					this.provider.onchange = () => {
						const { min, max, type } = (this.attrs || {}) as Partial<ConfigTagMap['input']>;
						/** 计算属性，不能超过 min 和 max */
						if (type === 'number') {
							const val = parseFloat(this.provider.value);
							const _min = min ? parseFloat(min) : undefined;
							const _max = max ? parseFloat(max) : undefined;
							if (_min && val < _min) {
								this.provider.value = _min.toString();
							} else if (_max && val > _max) {
								this.provider.value = _max.toString();
							} else {
								$store.set(this.key, val);
							}
						} else {
							$store.set(this.key, this.provider.value);
						}
					};
				}
				break;
			}
		}

		this.wrapper.replaceChildren(this.provider);
		this.append(this.label, this.wrapper);

		// 合并元素属性
		for (const key in this.attrs) {
			if (Object.prototype.hasOwnProperty.call(this.attrs, key)) {
				Reflect.set(this.provider, key, Reflect.get(this.attrs, key));
			}
		}

		// 处理跨域
		if (this.sync) {
			$store.addChangeListener(this.key, (pre, curr, remote) => {
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
