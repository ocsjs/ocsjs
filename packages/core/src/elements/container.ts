import { el, tooltip } from '../utils/dom';
import { IElement } from './interface';

export class ContainerElement extends IElement {
	header: HTMLElement = tooltip(el('div', { className: 'header', title: '菜单栏-可拖动区域' }));
	body: HTMLElement = el('div', { className: 'body' });

	connectedCallback() {
		this.append(this.header, this.body);
	}
}
