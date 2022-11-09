import { ConfigElement } from './config';
import { ContainerElement } from './container';
import { HeaderElement } from './header';
import { MessageElement } from './message';
import { ModelElement } from './model';
import { ScriptPanelElement } from './script.panel';

export class IElement extends HTMLElement {}

export interface CustomElementTagMap {
	'container-element': ContainerElement;
	'config-element': ConfigElement;
	'model-element': ModelElement;
	'message-element': MessageElement;
	'script-panel-element': ScriptPanelElement;
	'header-element': HeaderElement;
}
