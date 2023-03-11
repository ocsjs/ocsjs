import type { Page } from 'playwright-core';
import { slowType } from '../../utils';
import axios from 'axios';
import { PlaywrightScript } from '../../script';

export const CXUnitLoginScript = new PlaywrightScript(
	{
		unit: {
			label: '学校/单位',
			value: ''
		},
		id: {
			label: '学号/工号',
			value: ''
		},
		password: {
			label: '密码',
			value: ''
		}
	},
	{
		name: '超星-学校机构登录',
		async run(page, configs) {
			try {
				if (await isNotLogin(page)) {
					/** 其他登录 */
					await Promise.all([page.waitForLoadState('networkidle'), page.click('#otherlogin')]);
					await page.waitForTimeout(3000);
					/** 输入机构名, 并等待搜索结果 */
					await slowType(page, '#inputunitname', configs.unit);
					await page.waitForTimeout(2000);
					/** 点击第一个结果 */
					await page.click('.filter-list > ul > li');
					await page.type('#uname', configs.id);
					await page.type('#password', configs.password);

					await login(page, {
						ocrApiUrl: 'http://localhost:15319/ocr',
						ocrApiImageKey: 'ocr'
					});
				}
			} catch (err) {
				CXUnitLoginScript.emit('script-error', String(err));
			}
		}
	}
);

export const CXPhoneLoginScript = new PlaywrightScript(
	{
		phone: {
			label: '手机号',
			value: ''
		},
		password: {
			label: '密码',
			value: ''
		}
	},
	{
		name: '超星-手机密码登录',
		async run(page, configs) {
			try {
				if (await isNotLogin(page)) {
					await page.type('#phone', configs.phone);
					await page.type('#pwd', configs.password);

					await login(page);
				}
			} catch (err) {
				CXPhoneLoginScript.emit('script-error', String(err));
			}
		}
	}
);

function login(
	page: Page,
	opts?: {
		ocrApiUrl?: string;
		ocrApiImageKey?: string;
	}
) {
	return new Promise<void>((resolve, reject) => {
		// 监听登录状态
		const listenerLogin = (page: Page) => {
			// 登录成功
			if (page.url().includes('/space/index') || page.url().includes('/base')) {
				page.off('load', listenerLogin);
				resolve();
			}
		};

		page.on('load', listenerLogin);
		// 1分钟登录超时
		const timeout = setTimeout(() => {
			reject(new Error('登录超时,请重试。'));
		}, 60 * 1000);

		// 重试5次
		let tryCount = 5;
		// 尝试登录
		const tryLogin = async () => {
			tryCount--;
			const area = await page.$('#numVerCode');
			if (area !== null) {
				/** 破解验证码 */
				if (opts?.ocrApiUrl && opts?.ocrApiImageKey && area) {
					/** 每次都点击保证是最新图片 */
					await Promise.all([page.waitForLoadState('networkidle'), await area.click()]);
					const box = await area.boundingBox();
					if (box) {
						/** 请求验证码破解接口 */
						const body = Object.create([]);
						const buffer = await page.screenshot({ clip: box });
						Reflect.set(body, opts.ocrApiImageKey, buffer.toString('base64'));
						const {
							data: { ocr: code, canOCR, error }
						} = await axios.post(opts.ocrApiUrl, body);
						if (canOCR) {
							/** 破解验证码 */
							if (code) {
								await page.fill('#vercode', code);
							} else if (error) {
								console.error('error', error);
							}
						} else {
							return reject(new Error('未检测到图片验证码识别模块, 请手动输入验证码。'));
						}
					}
				}
			}

			// 点击登录
			await page.click('#loginBtn');
			await page.waitForTimeout(3000);

			// 检测错误
			const vercodeMsg = await page.evaluate(() =>
				Array.from(document.querySelectorAll('#vercodeMsg.err-txt'))
					.map((e) => e.textContent?.trim() || '')
					.filter(Boolean)
			);

			const errors = await page.evaluate(() =>
				Array.from(document.querySelectorAll('.err-txt,.err-tip'))
					.map((e) => e.textContent?.trim() || '')
					.filter(Boolean)
			);

			if (vercodeMsg.concat(errors).some((str) => str.includes('验证码'))) {
				if (tryCount === 0) {
					clearTimeout(timeout);
					reject(new Error(vercodeMsg.join('\n').trim() + '，请尝试手动输入。'));
				} else {
					await tryLogin();
				}
			} else if (errors.length) {
				clearTimeout(timeout);
				reject(new Error(errors.join('\n').trim()));
			} else {
				clearTimeout(timeout);
			}
		};

		tryLogin();
	});
}

async function isNotLogin(page: Page) {
	await page.goto('https://i.chaoxing.com');
	await page.waitForTimeout(2000);

	return page.url().includes('passport2.chaoxing.com');
}
