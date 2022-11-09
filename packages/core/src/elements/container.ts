import { el, tooltip } from '../utils/dom';
import { HeaderElement } from './header';
import { IElement } from './interface';

export class ContainerElement extends IElement {
	header: HeaderElement = tooltip(el('header-element', { className: 'header', title: '菜单栏-可拖动区域' }));
	body: HTMLDivElement = el('div', { className: 'body', clientHeight: window.innerHeight / 2 });
	footer: HTMLDivElement = el('div', { className: 'footer' });

	connectedCallback() {
		this.append(this.header, this.body, this.footer);

		this.body.style.maxHeight = window.innerHeight - 200 + 'px';
		this.body.style.maxWidth = window.innerWidth - 200 + 'px';
	}
}
