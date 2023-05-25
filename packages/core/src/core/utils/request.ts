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
		data?: Record<string, string>;
	}
): Promise<T extends 'json' ? any : string> {
	return new Promise((resolve, reject) => {
		try {
			/** 默认参数 */
			const { responseType = 'json', method = 'get', type = 'fetch', data = {}, headers = {} } = opts || {};
			/** 环境变量 */
			const env = $.isInBrowser() ? 'browser' : 'node';

			/** 如果是跨域模式并且是浏览器环境 */
			if (type === 'GM_xmlhttpRequest' && env === 'browser') {
				if (typeof GM_xmlhttpRequest !== 'undefined') {
					// eslint-disable-next-line no-undef
					GM_xmlhttpRequest({
						url,
						method: method.toUpperCase() as 'GET' | 'HEAD' | 'POST',
						data: Object.keys(data).length ? new URLSearchParams(data).toString() : undefined,
						headers: Object.keys(headers).length ? headers : undefined,
						responseType: responseType === 'json' ? 'json' : undefined,
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
						onerror: (err) => {
							console.error('GM_xmlhttpRequest error', err);
							reject(err);
						}
					});
				} else {
					reject(new Error('GM_xmlhttpRequest is not defined'));
				}
			} else {
				const fet: typeof fetch = env === 'node' ? require('node-fetch').default : fetch;

				fet(url, { body: method === 'post' ? JSON.stringify(data) : undefined, method, headers })
					.then((response) => {
						if (responseType === 'json') {
							response.json().then(resolve).catch(reject);
						} else {
							// @ts-ignore
							response.text().then(resolve).catch(reject);
						}
					})
					.catch((error) => {
						reject(new Error(error));
					});
			}
		} catch (error) {
			reject(error);
		}
	});
}
