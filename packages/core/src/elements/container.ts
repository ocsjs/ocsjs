import { el } from '../utils/dom';
import { IElement } from './interface';

export class ContainerElement extends IElement {
	header: HTMLElement;
	body: HTMLElement;
	footer: HTMLElement;
	constructor() {
		super();
		this.header = el('div');
		this.body = el('div');
		this.footer = el('div');
		this.append(this.header, this.body, this.footer);
	}
}
