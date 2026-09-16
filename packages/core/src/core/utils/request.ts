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
		/**
		 * 状态探测场景：收到任何 HTTP 状态码都不 reject，
		 * 统一 resolve `{ status: number, responseText: string }`（仅网络错误才 reject）。
		 * 不传时保持原行为（GM 分支仅 200 resolve，fetch 分支不校验状态码）。
		 */
		anyStatus?: boolean;
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
						onload: (response) => {
							if (opts.anyStatus) {
								resolve({ status: response.status, responseText: response.responseText || '' } as any);
								return;
							}
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
						if (opts.anyStatus) {
							response
								.text()
								.then((text) => resolve({ status: response.status, responseText: text } as any))
								.catch(reject);
							return;
						}
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
