import { IElement } from './interface';
import { el } from '../utils/dom';

export class DropdownElement extends IElement {
	/** 触发元素 */
	triggerElement: HTMLElement = el('button');
	/** 下拉框内容 */
	content: HTMLDivElement = el('div', { className: 'dropdown-content' });
	trigger: 'hover' | 'click' = 'hover';

	connectedCallback() {
		this.append(this.triggerElement, this.content);
		this.classList.add('dropdown');

		if (this.trigger === 'click') {
			this.triggerElement.onclick = () => {
				this.content.classList.toggle('show');
			};
		} else {
			this.triggerElement.onmouseover = () => {
				this.content.classList.add('show');
			};

			this.triggerElement.onmouseout = () => {
				this.content.classList.remove('show');
			};

			this.content.onmouseover = () => {
				this.content.classList.add('show');
			};

			this.content.onmouseout = () => {
				this.content.classList.remove('show');
			};
		}

		this.content.onclick = () => {
			this.content.classList.remove('show');
		};
	}
}
