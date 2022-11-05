import { ConfigElement } from './config';
import { ContainerElement } from './container';

export class IElement extends HTMLElement {}

export interface CustomElementTagMap {
	'container-element': ContainerElement;
	'config-element': ConfigElement;
}
