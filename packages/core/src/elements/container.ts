import { el } from '../utils/dom';
import { IElement } from './interface';

export class ContainerElement extends IElement {
	header: HTMLElement = el('div');
	body: HTMLElement = el('div');
	footer: HTMLElement = el('div');

	connectedCallback() {
		this.append(this.header, this.body, this.footer);
	}
}
