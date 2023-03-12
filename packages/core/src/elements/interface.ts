import { ConfigElement } from './config';
import { ContainerElement } from './container';
import { DropdownElement } from './dropdown';
import { HeaderElement } from './header';
import { MessageElement } from './message';
import { ModelElement } from './model';
import { ScriptPanelElement } from './script.panel';
import { SearchResultsElement } from './search.results';

export class IElement extends HTMLElement {}

export interface CustomElementTagMap {
	'container-element': ContainerElement;
	'config-element': ConfigElement;
	'model-element': ModelElement;
	'message-element': MessageElement;
	'script-panel-element': ScriptPanelElement;
	'header-element': HeaderElement;
	'search-results-element': SearchResultsElement;
	'dropdown-element': DropdownElement;
}
