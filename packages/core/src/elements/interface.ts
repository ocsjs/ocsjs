import { ConfigElement } from './config';
import { ContainerElement } from './container';
import { MessageElement } from './message';
import { ModelElement } from './model';

export class IElement extends HTMLElement {}

export interface CustomElementTagMap {
	'container-element': ContainerElement;
	'config-element': ConfigElement;
	'model-element': ModelElement;
	'message-element': MessageElement;
}
