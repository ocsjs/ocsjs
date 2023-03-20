import { IElement } from './interface';

export class HeaderElement extends IElement {
	/** 最小化/最大化按钮 */
	visualSwitcher?: HTMLDivElement;

	connectedCallback() {
		this.append(this.visualSwitcher || '');
	}
}
