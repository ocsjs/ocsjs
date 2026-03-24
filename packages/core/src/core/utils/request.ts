import { $ } from '../../utils/common';

/**
 * 发起请求
 * @param url 请求地址
 * @param opts 请求参数
 */
export function request<T extends 'json' | 'text'>(
	url: string,
	opts: {
		type: 'fetch' | 'GM_xmlhttpRequest';
		method?: 'get' | 'post' | 'head';
		responseType?: T;
		headers?: Record<string, string>;
		data?: Record<string, any>;
		timeout?: number;
	}
): Promise<T extends 'json' ? any : string> {
	return new Promise((resolve, reject) => {
		try {
			/** 默认参数 */
			const { responseType = 'json', method = 'get', type = 'fetch', data = {}, headers = {}, timeout = 60000 } = opts || {};
			/** 环境变量 */
			const env = $.isInBrowser() ? 'browser' : 'node';

			/** 如果是跨域模式并且是浏览器环境 */
			if (type === 'GM_xmlhttpRequest' && env === 'browser') {
				if (typeof GM_xmlhttpRequest !== 'undefined') {
					const contentType = headers['Content-Type'] || headers['content-type'];
					const requestData =
						contentType === 'application/x-www-form-urlencoded'
							? new URLSearchParams(data).toString()
							: Object.keys(data).length
							? JSON.stringify(data)
							: undefined;
					// eslint-disable-next-line no-undef
					GM_xmlhttpRequest({
						url,
						method: method.toUpperCase() as 'GET' | 'HEAD' | 'POST',
						data: requestData,
						headers: Object.keys(headers).length ? headers : undefined,
						responseType: responseType === 'json' ? 'json' : undefined,
						timeout,
						onload: (response) => {
							if (response.status === 200) {
								if (responseType === 'json') {
									try {
										resolve(JSON.parse(response.responseText));
									} catch (error) {
										reject(error);
									}
								} else {
									resolve(response.responseText || '');
								}
							} else {
								reject(response.responseText);
							}
						},
						ontimeout: () => {
							reject(new Error('GM_xmlhttpRequest 请求超时'));
						},
						onerror: (err: any) => {
							console.error('GM_xmlhttpRequest error', err);
							reject(new Error(err?.error || 'GM_xmlhttpRequest 请求失败'));
						}
					});
				} else {
					reject(new Error('GM_xmlhttpRequest is not defined'));
				}
			} else {
				const fet: typeof fetch = env === 'node' ? require('node-fetch').default : fetch;

				const controller = new AbortController();
				const timer = setTimeout(() => controller.abort(), timeout);

				fet(url, { body: method === 'post' ? JSON.stringify(data) : undefined, method, headers, signal: controller.signal as any })
					.then((response) => {
						clearTimeout(timer);
						if (responseType === 'json') {
							response.json().then(resolve).catch(reject);
						} else {
							// @ts-ignore
							response.text().then(resolve).catch(reject);
						}
					})
					.catch((error) => {
						clearTimeout(timer);
						reject(new Error(error));
					});
			}
		} catch (error) {
			reject(error);
		}
	});
}
