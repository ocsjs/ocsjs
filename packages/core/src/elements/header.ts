import { IElement } from './interface';

export class HeaderElement extends IElement {
	/** 关闭按钮 */
	closeButton?: HTMLDivElement;
	/** 最小化/最大化按钮 */
	visualSwitcher?: HTMLDivElement;

	connectedCallback() {
		this.append(this.visualSwitcher || '', this.closeButton || '');
	}
}
