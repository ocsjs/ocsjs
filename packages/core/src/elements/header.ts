import { IElement } from './interface';

export class HeaderElement extends IElement {
	/** 关闭按钮 */
	closeButton?: HTMLDivElement;
	/** 最小化/最大化按钮 */
	visualSwitcher?: HTMLDivElement;
	/** 展开/收缩按钮 */
	expandSwitcher?: HTMLDivElement;
	/** 工程选择器 */
	projectSelector?: HTMLDivElement;
	/** logo */
	logo?: HTMLDivElement;
	/** 简介 */
	profile?: HTMLDivElement;

	connectedCallback() {
		this.append(
			this.profile || '',
			this.projectSelector || '',
			this.logo || '',
			this.expandSwitcher || '',
			this.visualSwitcher || '',
			this.closeButton || ''
		);
	}
}
