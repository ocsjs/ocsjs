import { Page } from 'playwright-core';
import { BaseAutomationEvents, Config, ConfigValueRecord, EventsRecord, TypedEventEmitter } from './interface';

export type RunFunction = (...args: any[]) => any;

export interface ScriptOptions<Run extends RunFunction = RunFunction> {
	name: string;
	run: Run;
}

export abstract class Script<Run extends RunFunction = RunFunction, E extends EventsRecord = EventsRecord>
	extends TypedEventEmitter<E>
	implements ScriptOptions
{
	name: string;
	run: Run;

	constructor(opts: ScriptOptions<Run>) {
		super();
		this.name = opts.name;
		this.run = opts.run;
	}
}

/** 收集脚本 */
export abstract class CollectorScript<
	Run extends RunFunction = RunFunction,
	E extends EventsRecord = EventsRecord
> extends Script<Run, E> {}

/** 自动化脚本 */
export abstract class AutomationScript<
	Run extends RunFunction = RunFunction,
	E extends EventsRecord = EventsRecord
> extends Script<Run, E> {}

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
