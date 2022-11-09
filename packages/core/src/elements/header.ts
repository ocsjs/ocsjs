import { IElement } from './interface';

export class HeaderElement extends IElement {
	closeButton?: HTMLDivElement;
	visualSwitcher?: HTMLDivElement;
	expandSwitcher?: HTMLDivElement;
	projectSelector?: HTMLSelectElement;
	logo?: HTMLDivElement;
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
