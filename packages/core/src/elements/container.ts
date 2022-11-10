import { el, tooltip } from '../utils/dom';
import { HeaderElement } from './header';
import { IElement } from './interface';

export class ContainerElement extends IElement {
	header: HeaderElement = tooltip(el('header-element', { className: 'header', title: '菜单栏-可拖动区域' }));
	body: HTMLDivElement = el('div', { className: 'body', clientHeight: window.innerHeight / 2 });
	footer: HTMLDivElement = el('div', { className: 'footer' });

	connectedCallback() {
		this.append(this.header, this.body, this.footer);

		const resize = () => {
			this.body.style.maxHeight = window.innerHeight - this.header.clientHeight - 100 + 'px';
			this.body.style.maxWidth = window.innerWidth - 50 + 'px';
		};
		resize();
		window.addEventListener('resize', resize);
	}
}
