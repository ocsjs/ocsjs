import { request } from '@ocsjs/core';

/**
 * 文字识别
 * @param cloudApis
 * @param text
 */
export async function translate(cloudApis: string, text: string) {
	return await request(cloudApis, {
		method: 'post',
		type: 'GM_xmlhttpRequest',
		headers: {
			'Content-Type': 'application/json'
		},
		responseType: 'json',
		data: {
			app: 'tmt',
			data: {
				tmt: {
					source: 'en',
					target: 'zh',
					text: text
				}
			}
		}
	});
}

/**
 * 语音识别
 * @param cloudApis
 * @param mp3_url
 */
export async function asr(cloudApis: string, mp3_url: string) {
	return await request(cloudApis, {
		method: 'post',
		type: 'GM_xmlhttpRequest',
		headers: {
			'Content-Type': 'application/json'
		},
		responseType: 'json',
		data: {
			app: 'asr',
			data: {
				asr: {
					url: mp3_url
				}
			}
		}
	});
}
