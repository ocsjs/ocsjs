import type { Page } from 'playwright-core';
import { request } from '../core/utils';
import { $ } from './common';
import { $elements, $message } from 'easy-us';

export type Base64 = string;

interface ClickOptions {
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

export interface RemotePage {
	click: (selectorOrElement: string | Element, options?: ClickOptions) => Promise<void>;
	check: Page['check'];
	dblclick: Page['dblclick'];
	bringToFront: Page['bringToFront'];
	dragAndDrop: Page['dragAndDrop'];
	inputValue: Page['inputValue'];
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
		body: string;
		headers: Record<string, string>;
		status: number;
		url: string;
	}>;
	waitForSelector(...args: Parameters<Page['waitForSelector']>): Promise<void>;
	['keyboard.type']: Page['keyboard']['type'];
	['keyboard.press']: Page['keyboard']['press'];
	['mouse.wheel']: Page['mouse']['wheel'];
	['mouse.click']: Page['mouse']['click'];
	['mouse.dblclick']: Page['mouse']['dblclick'];
	['mouse.down']: Page['mouse']['down'];
	['mouse.up']: Page['mouse']['up'];
	['mouse.move']: Page['mouse']['move'];
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
	'waitForSelector',
	'keyboard.type',
	'keyboard.press',
	'mouse.wheel',
	'mouse.click',
	'mouse.dblclick',
	'mouse.down',
	'mouse.up',
	'mouse.move'
];

const mouseIdleRequireActions = [
	'click',
	'dblclick',
	'dragAndDrop',
	'fill',
	'hover',
	'tap',
	'press',
	'keyboard.type',
	'keyboard.press',
	'mouse.wheel',
	'mouse.click',
	'mouse.dblclick',
	'mouse.down',
	'mouse.up',
	'mouse.move'
];

export class RemotePlaywright {
	private static authToken = '';
	private static currentPage: RemotePage | undefined = undefined;

	static async getRemotePage(
		show_debug_cursor?: boolean,
		logger?: (...args: any[]) => void
	): Promise<RemotePage | undefined> {
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
				this.currentPage = this.createRemotePage(this.authToken, { show_debug_cursor, logger });
				return this.currentPage;
			} catch (e) {
				console.log(e);
				return undefined;
			}
		} else {
			this.currentPage = this.createRemotePage(this.authToken, { show_debug_cursor, logger });
			return this.currentPage;
		}
	}

	private static createRemotePage(
		authToken: string,
		configs?: { show_debug_cursor?: boolean; logger?: (...args: any[]) => void }
	) {
		const page = Object.create({});
		configs = configs || {};
		configs.logger = configs.logger || console.debug;
		for (const property of ListOfActions) {
			Reflect.set(page, property, async (...args: any[]) => {
				let data;

				if (mouseIdleRequireActions.includes(property)) {
					// 等待鼠标静止/空闲
					await waitForMouseIdle();
				}

				if (property === 'click') {
					if (args[0] instanceof Element) {
						const el = args[0] as HTMLElement;
						const options = (args[1] || {}) as ClickOptions;

						await scrollToElement(el);
						// 如果是传入的元素对象，那么就解析元素的坐标进行点击
						// 这里滑动的时间可能会比较长，取决于页面的长度，所以这里多等待一点时间
						await $.sleep(500);
						const rect = el.getBoundingClientRect();

						// 移动可能阻挡点击的脚本面板
						const elFromPoint = $elements.root?.elementFromPoint(
							rect.left + rect.width / 2,
							rect.top + rect.height / 2
						);
						if (elFromPoint && $elements.root && $elements.root.contains(elFromPoint)) {
							// 如果元素在根节点内，则隐藏面板
							const panel = $elements.root.querySelector<HTMLElement>('container-element');

							if (panel) {
								$message.info({ content: '检测到脚本阻挡点击位置，已自动移开', duration: 2 });
								await $.transition(panel, 'left', 0.1, rect.left + rect.width / 2 + 100 + 'px', { reset_ms: 1 });
							}
						}

						// 显示鼠标位置
						if (configs?.show_debug_cursor) {
							showMousePointer(el);
						}

						data = {
							page: window.location.href,
							property: 'mouse.click',
							args: [
								rect.left + rect.width / 2,
								rect.top + rect.height / 2,
								{
									button: options.button,
									clickCount: options.clickCount,
									delay: options.delay
								}
							]
						};
					} else if (typeof args[0] === 'string') {
						const el = document.querySelector(args[0]) as HTMLElement;
						if (el) {
							await scrollToElement(el);
							// 显示鼠标位置
							if (configs?.show_debug_cursor) {
								showMousePointer(el);
							}
						}
					}
				}

				if (!data) {
					data = { page: window.location.href, property: property, args: args };
				}

				configs?.logger?.('[RP]: ', JSON.stringify(data));

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
					configs?.logger?.('[RP-ERROR]: ', JSON.stringify(data));
					return undefined;
				}
			});
		}
		console.log(page);

		return page;
	}
}

/**
 * 获取当前页面 html 上的 CSS zoom 缩放比例（例如智慧树低分辨率时会自动设置 zoom 缩放）。
 *
 * 标准化 zoom 下的坐标系关系：
 * - getBoundingClientRect / CDP 鼠标事件坐标：真实渲染（视觉）坐标，两者一致，无需换算；
 * - position:fixed 的 left/top：布局坐标，绘制时会再乘一次 zoom。
 * 所以在页面内用 fixed 元素标注某个点时，需要将 rect 坐标除以 zoom 换算回布局坐标，否则标注位置会产生偏移。
 */
function getPageZoomScale(): number {
	const zoom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('zoom') || '1');
	return Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
}

function scrollToElement(el: HTMLElement) {
	el.scrollIntoView({ behavior: 'smooth', block: 'center' });
	// 等待动作完成
	return $.sleep(200);
}

function showMousePointer(el: HTMLElement) {
	setTimeout(() => {
		const rect = el.getBoundingClientRect();
		// fixed 定位的 left/top 是布局坐标（绘制时会再乘 zoom），
		// 而 getBoundingClientRect 返回的是真实渲染坐标，这里除以 zoom 换算回布局坐标，保证缩放页面下红点位置不偏移
		const zoomScale = getPageZoomScale();
		const x = (rect.left + rect.width / 2) / zoomScale;
		const y = (rect.top + rect.height / 2) / zoomScale;

		// 中心圆点
		const dot = document.createElement('div');
		dot.style.cssText = [
			'position:fixed',
			'z-index:99999',
			'pointer-events:none',
			'width:12px',
			'height:12px',
			'background:rgba(255,0,0,0.7)',
			'border-radius:50%',
			`left:${x - 6}px`,
			`top:${y - 6}px`
		].join(';');

		// 涟漪波纹（向外扩散并淡出）
		const ripple = document.createElement('div');
		ripple.style.cssText = [
			'position:fixed',
			'z-index:99998',
			'pointer-events:none',
			'width:24px',
			'height:24px',
			'border:2px solid rgba(255,0,0,0.8)',
			'border-radius:50%',
			`left:${x - 13}px`,
			`top:${y - 13}px`
		].join(';');
		ripple.animate(
			[
				{ transform: 'scale(0.5)', opacity: 1 },
				{ transform: 'scale(2.5)', opacity: 0 }
			],
			{ duration: 600, easing: 'ease-out' }
		);

		document.body.append(dot, ripple);
		setTimeout(() => {
			dot.remove();
			ripple.remove();
		}, 700);
	}, 100);
}

function waitForMouseIdle(timeout: number = 200): Promise<void> {
	return new Promise((resolve) => {
		let timer: any;
		const default_timer = setTimeout(() => {
			window.removeEventListener('mousemove', onMouseMove);
			resolve();
		}, timeout); // 最多等timeout + 1000ms
		function onMouseMove() {
			clearTimeout(default_timer);
			if (timer) {
				clearTimeout(timer);
			}
			timer = setTimeout(() => {
				window.removeEventListener('mousemove', onMouseMove);
				resolve();
			}, timeout);
		}
		window.addEventListener('mousemove', onMouseMove);
	});
}
