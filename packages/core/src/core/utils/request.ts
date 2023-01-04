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
		method?: 'get' | 'post';
		contentType?: T;
		headers?: Record<string, string>;
		data?: Record<string, string>;
	}
): Promise<T extends 'json' ? Record<string, any> : string> {
	return new Promise((resolve, reject) => {
		try {
			/** 默认参数 */
			const { contentType = 'json', method = 'get', type = 'fetch', data = {}, headers = {} } = opts || {};
			/** 环境变量 */
			const env = $.isInBrowser() ? 'browser' : 'node';

			/** 如果是跨域模式并且是浏览器环境 */
			if (type === 'GM_xmlhttpRequest' && env === 'browser') {
				if (typeof GM_xmlhttpRequest !== 'undefined') {
					// eslint-disable-next-line no-undef
					GM_xmlhttpRequest({
						url,
						method: method === 'get' ? 'GET' : 'POST',
						data: new URLSearchParams(data).toString(),
						headers: headers,
						responseType: 'json',
						onload: (response) => {
							if (response.status === 200) {
								if (contentType === 'json') {
									try {
										resolve(JSON.parse(response.responseText));
									} catch (error) {
										reject(error);
									}
								} else {
									resolve(response.responseText as any);
								}
							} else {
								reject(response.responseText);
							}
						},
						onerror: reject
					});
				} else {
					reject(new Error('GM_xmlhttpRequest is not defined'));
				}
			} else {
				const fet: (...args: any[]) => Promise<Response> = env === 'node' ? require('node-fetch').default : fetch;

				fet(url, { contentType, body: method === 'post' ? data : undefined, method, headers })
					.then((response) => {
						if (contentType === 'json') {
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
