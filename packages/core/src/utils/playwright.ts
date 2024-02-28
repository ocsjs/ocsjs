import type { Page } from 'playwright-core';
import { request } from '../core/utils';
import { $ } from './common';

export type Base64 = string;

export interface RemotePage {
	click: (
		selectorOrElement: string | Element,
		options?: {
			/**
			 * Defaults to `left`.
			 */
			button?: 'left' | 'right' | 'middle';

			/**
			 * defaults to 1. See [UIEvent.detail].
			 */
			clickCount?: number;

			/**
			 * Time to wait between `mousedown` and `mouseup` in milliseconds. Defaults to 0.
			 */
			delay?: number;

			/**
			 * Whether to bypass the [actionability](https://playwright.dev/docs/actionability) checks. Defaults to `false`.
			 */
			force?: boolean;

			/**
			 * Modifier keys to press. Ensures that only these modifiers are pressed during the operation, and then restores
			 * current modifiers back. If not specified, currently pressed modifiers are used.
			 */
			modifiers?: Array<'Alt' | 'Control' | 'Meta' | 'Shift'>;

			/**
			 * Actions that initiate navigations are waiting for these navigations to happen and for pages to start loading. You
			 * can opt out of waiting via setting this flag. You would only need this option in the exceptional cases such as
			 * navigating to inaccessible pages. Defaults to `false`.
			 */
			noWaitAfter?: boolean;

			/**
			 * A point to use relative to the top-left corner of element padding box. If not specified, uses some visible point of
			 * the element.
			 */
			position?: {
				x: number;

				y: number;
			};

			/**
			 * When true, the call requires selector to resolve to a single element. If given selector resolves to more than one
			 * element, the call throws an exception.
			 */
			strict?: boolean;

			/**
			 * Maximum time in milliseconds. Defaults to `0` - no timeout. The default value can be changed via `actionTimeout`
			 * option in the config, or by using the
			 * [browserContext.setDefaultTimeout(timeout)](https://playwright.dev/docs/api/class-browsercontext#browser-context-set-default-timeout)
			 * or [page.setDefaultTimeout(timeout)](https://playwright.dev/docs/api/class-page#page-set-default-timeout) methods.
			 */
			timeout?: number;

			/**
			 * When set, this method only performs the [actionability](https://playwright.dev/docs/actionability) checks and skips the action. Defaults
			 * to `false`. Useful to wait until the element is ready for the action without performing it.
			 */
			trial?: boolean;
		}
	) => Promise<void>;
	check: Page['check'];
	dblclick: Page['dblclick'];
	bringToFront: Page['bringToFront'];
	dragAndDrop: Page['dragAndDrop'];
	fill: Page['fill'];
	focus: Page['focus'];
	hover: Page['hover'];
	screenshot: Page['screenshot'];
	selectOption: Page['selectOption'];
	setInputFiles: Page['setInputFiles'];
	tap: Page['tap'];
	press: Page['press'];
	reload: (...args: Parameters<Page['reload']>) => Promise<Base64>;
	waitForRequest(...args: Parameters<Page['waitForRequest']>): Promise<{
		url: string;
		method: string;
		headers: Record<string, string>;
		postData: string;
	}>;
	waitForResponse(...args: Parameters<Page['waitForResponse']>): Promise<{
		text: string;
		headers: Record<string, string>;
		status: number;
		url: string;
	}>;
	waitForSelector(...args: Parameters<Page['waitForSelector']>): Promise<void>;
}

const ListOfActions = [
	'click',
	'check',
	'dblclick',
	'bringToFront',
	'dragAndDrop',
	'fill',
	'focus',
	'hover',
	'screenshot',
	'selectOption',
	'setInputFiles',
	'tap',
	'press',
	'reload',
	'waitForRequest',
	'waitForResponse',
	'waitForSelector'
];

export class RemotePlaywright {
	private static authToken = '';
	private static currentPage: RemotePage | undefined = undefined;

	static async getCurrentPage(logger: (...args: any[]) => void = console.debug): Promise<RemotePage | undefined> {
		if (this.currentPage) {
			return this.currentPage;
		}
		/**
		 * OCS桌面端后端无法拦截 GM_xmlhttpRequest ，所以这里使用 fetch 请求动作执行，然后后端根据key判断是否允许执行
		 */
		if (!this.authToken) {
			try {
				this.authToken = await request('http://localhost:15319/get-actions-key', {
					type: 'GM_xmlhttpRequest',
					method: 'get',
					responseType: 'text'
				});
				this.currentPage = this.createRemotePage(this.authToken, logger);
				return this.currentPage;
			} catch (e) {
				console.log(e);
				return undefined;
			}
		} else {
			this.currentPage = this.createRemotePage(this.authToken, logger);
			return this.currentPage;
		}
	}

	private static createRemotePage(authToken: string, logger?: (...args: any[]) => void) {
		const page = Object.create({});
		for (const property of ListOfActions) {
			Reflect.set(page, property, async (...args: any[]) => {
				let data;
				if (property === 'click' && args[0] instanceof Element) {
					args[0].scrollIntoView();
					await $.sleep(1000);
					const rect = args[0].getBoundingClientRect();
					data = {
						page: window.location.href,
						property: 'mouse.click',
						args: [
							rect.left + rect.width / 2,
							rect.top + rect.height / 2,
							{
								button: args[1]?.button,
								clickCount: args[1]?.clickCount,
								delay: args[1]?.delay
							}
						]
					};
				}

				if (!data) {
					data = { page: window.location.href, property: property, args: args };
				}

				logger?.('[RP]: ', JSON.stringify(data));

				try {
					// 这里为什么不写前缀 http://localhost:15319，因为有 Content-Security-Policy ， 这里我们借用后台的URL代理去进行处理，只要包含 ocs-script-actions 即可轻松绕过 Content-Security-Policy 限制
					const res = await request('/ocs-script-actions', {
						type: 'fetch',
						method: 'post',
						responseType: ['waitForRequest', 'waitForResponse', 'reload'].includes(property) ? 'json' : 'text',
						headers: {
							'auth-token': authToken
						},
						data: data
					});
					return res;
				} catch (e) {
					logger?.('[RP-ERROR]: ', JSON.stringify(data));
					return undefined;
				}
			});
		}
		console.log(page);

		return page;
	}
}
