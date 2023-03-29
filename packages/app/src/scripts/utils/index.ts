import type { ElementHandle, Page } from 'playwright-core';
import axios from 'axios';

/** 缓慢输入 */
export function slowType(page: Page, selector: string, text: string) {
	return page.type(selector, text, { delay: 100 });
}

/** 验证码破解 */
export async function breakVerifyCode(
	page: Page,
	imageElement: ElementHandle<any>,
	options: { ocrApiUrl: string; ocrApiImageKey: string }
) {
	const box = await imageElement.boundingBox();
	if (box) {
		/** 请求验证码破解接口 */
		const body = Object.create([]);
		const buffer = await page.screenshot({ clip: box });
		Reflect.set(body, options.ocrApiImageKey, buffer.toString('base64'));
		const {
			data: { code, canOCR, error }
		} = await axios.post(options.ocrApiUrl, body);
		if (canOCR) {
			/** 破解验证码 */
			if (code) {
				await page.fill('#vercode', code);
			} else if (error) {
				throw new Error(error);
			}
		} else {
			throw new Error('未检测到图片验证码识别模块, 请手动输入验证码。');
		}
	}
}
