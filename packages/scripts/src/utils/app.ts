import { $, $creator, $message, el, request } from '@ocsjs/core';
import { $console } from '../projects/background';

let actions_key = '';

export const $app_actions = {
	showError: () => {
		$message('error', {
			duration: 60,
			content: el('div', [
				'软件辅助启动失败，请检查网络，或者使用OCS桌面软件运行浏览器，教程/疑问：',
				$creator.button('软件辅助开启教程', {
					onclick: () => {
						window.open('https://docs.ocsjs.com/docs/script-helper');
					}
				})
			])
		});
	},
	init: async () => {
		/**
		 * OCS桌面端后端无法拦截 GM_xmlhttpRequest ，所以这里使用 fetch 请求动作执行，然后后端根据key判断是否允许执行
		 */
		if (!actions_key) {
			try {
				actions_key = await request('http://localhost:15319/get-actions-key', {
					type: 'GM_xmlhttpRequest',
					method: 'get',
					responseType: 'text'
				});
				return true;
			} catch (e) {
				console.log(e);
				return false;
			}
		} else {
			return true;
		}
	},
	waitForResponse: async (
		url: string,
		options?: {
			period?: number;
			timeout?: number;
			responseType?: 'text' | 'json';
		}
	) => {
		await appActionRequest(
			{
				url,
				action: 'listen-request'
			},
			{
				/** 智慧树考试页面会有 content-security-policy ，会被浏览器拦截， 所以用他的域名请求，然后让软件拦截即可 */
				baseUrl: 'https://onlineexamh5new.zhihuishu.com/'
			}
		);
		return new Promise((resolve, reject) => {
			const interval = setInterval(async () => {
				try {
					const res = await appActionRequest(
						{
							url,
							action: 'get-listened-request'
						},
						{ baseUrl: 'https://onlineexamh5new.zhihuishu.com/', responseType: options?.responseType || 'text' }
					);
					if (res) {
						clearInterval(interval);
						resolve(res);
					}
				} catch (e) {
					$console.error('waitForResponse', String(e));
				}
			}, options?.period || 3000);

			setTimeout(() => {
				clearInterval(interval);
			}, options?.timeout || 60 * 1000);
		});
	},
	mouseMove: async (x: number, y: number) => {
		return await appActionRequest({
			x: x.toString(),
			y: y.toString(),
			action: 'mouse-move'
		});
	},
	mouseClick: async (elementOrSelector: HTMLElement | Element | null | undefined | string, count: number = 1) => {
		if (!elementOrSelector) {
			return;
		}

		if (elementOrSelector instanceof Element) {
			elementOrSelector.scrollIntoView();
			await $.sleep(1000);
			const rect = elementOrSelector.getBoundingClientRect();
			return await appActionRequest({
				x: rect.x.toString(),
				y: rect.y.toString(),
				count: count.toString(),
				action: 'mouse-click'
			});
		} else {
			return await appActionRequest({
				selector: elementOrSelector,
				action: 'mouse-click'
			});
		}
	}
};

async function appActionRequest(
	data: Record<string, string>,
	options?: {
		baseUrl?: string;
		responseType?: 'text' | 'json';
	}
): Promise<string> {
	await $app_actions.init();
	if (!actions_key) {
		return '';
	}
	data = Object.assign({ page: window.location.href }, data);

	try {
		const res = await request(
			(options?.baseUrl || 'http://localhost:15319') + '/ocs-script-actions?' + new URLSearchParams(data).toString(),
			{
				type: 'fetch',
				method: 'get',
				responseType: options?.responseType || 'text',
				headers: {
					'actions-key': actions_key
				}
			}
		);

		return String(res);
	} catch (e) {
		$console.error('软件辅助错误', String(e));
		return '';
	}
}
