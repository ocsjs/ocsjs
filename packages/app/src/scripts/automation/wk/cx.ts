import type { Page } from 'playwright-core';
import { breakVerifyCode, slowType } from '../../utils';
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
		async run(
			page,
			configs,
			options?: {
				ocrApiUrl?: string;
				ocrApiImageKey?: string;
			}
		) {
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
						ocrApiUrl: options?.ocrApiUrl,
						ocrApiImageKey: options?.ocrApiImageKey
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
					await breakVerifyCode(page, area, {
						ocrApiUrl: opts.ocrApiUrl,
						ocrApiImageKey: opts.ocrApiImageKey
					});
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
					throw new Error(vercodeMsg.join('\n').trim() + '，请尝试手动输入。');
				} else {
					await tryLogin();
				}
			} else if (errors.length) {
				clearTimeout(timeout);
				throw new Error(errors.join('\n').trim());
			} else {
				clearTimeout(timeout);
			}
		};

		tryLogin().catch(reject);
	});
}

async function isNotLogin(page: Page) {
	// 不能使用 https ，这里如果使用 https 在登录后会导致某些同学的课程无法访问
	await page.goto('http://i.chaoxing.com/');
	await page.waitForTimeout(2000);

	return page.url().includes('passport2.chaoxing.com');
}
