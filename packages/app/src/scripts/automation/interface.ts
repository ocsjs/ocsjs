import { Page } from 'playwright-core';
import { EventsRecord } from '../interface';
import { AutomationScript, RunFunction, ScriptOptions } from '../script';

export type BaseAutomationEvents = {
	'script-error': (...msg: string[]) => void;
	'script-data': (...msg: string[]) => void;
};

export interface Config {
	label: string;
	value: any;
	hide?: boolean;
}

export type ConfigValueRecord<C extends Record<string, Config>> = {
	[K in keyof C]: C[K]['value'];
};

export class ConfigsRequiredAutomationScript<
	C extends Record<string, Config> = Record<string, Config>,
	RF extends RunFunction = RunFunction,
	E extends EventsRecord = EventsRecord
> extends AutomationScript<RF, E> {
	name: string;
	configs: C;

	constructor(configs: C, options: ScriptOptions<RF>) {
		super(options);
		this.name = options.name;
		this.run = options.run;
		this.configs = configs;
	}
}

export class PlaywrightScript<
	C extends Record<string, Config> = Record<string, Config>
> extends ConfigsRequiredAutomationScript<
	C,
	(page: Page, configs: ConfigValueRecord<C>) => any,
	BaseAutomationEvents
> {}
