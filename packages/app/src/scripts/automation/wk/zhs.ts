import { Page } from 'playwright-core';
import { slowType } from '../../utils';
import axios from 'axios';
import { PlaywrightScript } from '../../script';

export const ZHSUnitLoginScript = new PlaywrightScript(
	{
		schoolname: {
			label: '学校',
			value: ''
		},
		id: {
			label: '学号',
			value: ''
		},
		password: {
			label: '密码',
			value: ''
		}
	},
	{
		name: '智慧树-学校登录',
		async run(
			page,
			configs,
			options?: {
				ocrApiUrl?: string;
				detTargetKey?: string;
				detBackgroundKey?: string;
			}
		) {
			try {
				if (await isNotLogin(page)) {
					await page.click('#qStudentID');
					// 取消我知道了弹窗
					await page.waitForTimeout(1000);
					await page.evaluate('userindex.closeStuCodeFirstLoginTip();');

					await slowType(page, '#quickSearch', configs.schoolname);
					// 显示学校列表
					await Promise.all([
						/** 为防止页面未加载学校数据，所以这里即可能为远程加载或者缓存读取学校记录 */
						Promise.race([
							/** 等待请求完成 */
							page.waitForResponse(/getAllSchool/),
							/** 等待元素出现 */
							page.waitForSelector('#schoolListCode li')
						]),
						page.evaluate('userindex.selectSchoolByName();')
					]);
					// 单击第一个匹配的学校
					await page.click('#schoolListCode li');
					await page.type('#clCode', configs.id);
					await page.type('#clPassword', configs.password);
					await page.waitForTimeout(3000);
					await page.click('.wall-sub-btn');

					if (options?.ocrApiUrl && options?.detTargetKey && options?.detBackgroundKey) {
						let count = 5;
						while (await isNotVerified(page)) {
							if (count > 0) {
								count--;
								await verify(page, {
									ocrApiUrl: options.ocrApiUrl,
									detTargetKey: options.detTargetKey,
									detBackgroundKey: options.detBackgroundKey
								});

								await page.waitForTimeout(2000);
							} else {
								throw new Error('滑块识别失败，请手动登录。');
							}
						}
					}
				}
			} catch (err) {
				ZHSUnitLoginScript.emit('script-error', String(err));
			}
		}
	}
);

export const ZHSPhoneLoginScript = new PlaywrightScript(
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
		name: '智慧树-手机密码登录',
		async run(
			page,
			configs,
			options?: {
				ocrApiUrl?: string;
				detTargetKey?: string;
				detBackgroundKey?: string;
			}
		) {
			try {
				if (await isNotLogin(page)) {
					await page.click('#qSignin');
					await page.type('#lUsername', configs.phone);
					await page.type('#lPassword', configs.password);
					await page.waitForTimeout(3000);
					await page.click('.wall-sub-btn');

					if (options?.ocrApiUrl && options?.detTargetKey && options?.detBackgroundKey) {
						let count = 5;
						while ((await isNotVerified(page)) && count > 0) {
							count--;
							await verify(page, {
								ocrApiUrl: options.ocrApiUrl,
								detTargetKey: options.detTargetKey,
								detBackgroundKey: options.detBackgroundKey
							});

							await page.waitForTimeout(2000);
						}
					}
				}
			} catch (err) {
				ZHSPhoneLoginScript.emit('script-error', String(err));
			}
		}
	}
);

/**
 * 滑块验证
 */
async function verify(page: Page, opts: { ocrApiUrl: string; detTargetKey: string; detBackgroundKey: string }) {
	// 删除yidun遮挡
	await page.evaluate(() =>
		document.querySelectorAll('.yidun_cover-frame,.yidun_popup__mask').forEach((el) => el.remove())
	);

	const det_target_el = await page.$('[alt="验证码滑块"]');
	const det_bg_el = await page.$('[alt="验证码背景"]');

	if (det_target_el && det_bg_el) {
		const det_target_src = await det_target_el.getAttribute('src');
		const det_bg_src = await det_bg_el.getAttribute('src');
		if (det_target_src && det_bg_src) {
			const det_target_base64 = await getBase64(det_target_src);
			const det_bg_base64 = await getBase64(det_bg_src);

			const body = Object.create({});
			Reflect.set(body, opts.detTargetKey, det_target_base64);
			Reflect.set(body, opts.detBackgroundKey, det_bg_base64);

			const data = await axios.post(opts.ocrApiUrl, body);
			console.log('zhs ocr', JSON.stringify(data?.data));

			if (data?.data?.error) {
				console.error(data.data.error);
			} else {
				if (data?.data?.canOCR) {
					/** 破解滑块验证码 */
					const result: { target_y: number; target: number[] } = data?.data?.det;

					if (result) {
						const bg_rect = await det_target_el.evaluate((node) => node.getBoundingClientRect());
						const x1 = bg_rect.x + 10;
						const y1 = bg_rect.y + result.target_y;
						const x2 = bg_rect.x + result.target[0] + 20;
						const y2 = bg_rect.y + result.target[1];

						await page.mouse.move(x1, y1);
						await page.mouse.down();
						await page.mouse.move(x2, y2, { steps: 10 });
						await page.mouse.up();

						try {
							await page.waitForNavigation({ timeout: 3000, waitUntil: 'domcontentloaded' });
						} catch {}
					} else {
						console.error(`OCR_DET: `, {
							data,
							opts,
							det_bg_src,
							det_target_src,
							det_target_base64: det_target_base64.length,
							det_bg_base64: det_bg_base64.length
						});
						throw new Error('滑块验证识别失败，请尝试手动登录。');
					}
				} else {
					throw new Error('未检测到图片验证码识别模块, 请手动输入验证码。');
				}
			}
		}
	}
}

/** 是否未通过验证 */
async function isNotVerified(page: Page) {
	await page.waitForTimeout(2000);

	const errors = await page.evaluate(() =>
		Array.from(document.querySelectorAll('.switch-wrap-signin.active .form-ipt-error.is-visible'))
			.map((e) => e.textContent || '')
			.filter(Boolean)
	);

	if (errors.length) {
		throw new Error(errors.join('\n'));
	}

	return page.url().includes('passport.zhihuishu.com');
}

function getBase64(url: string) {
	return axios
		.get(url, {
			responseType: 'arraybuffer'
		})
		.then((response) => Buffer.from(response.data, 'binary').toString('base64'));
}

async function isNotLogin(page: Page) {
	await page.goto('https://www.zhihuishu.com/');
	await page.waitForTimeout(2000);
	const loginBtnNotDisplay = await page.evaluate(
		() => (document.querySelector('#login') as HTMLElement)?.style.display === 'none'
	);
	if (loginBtnNotDisplay) {
		await page.click('#notLogin');
	} else {
		await page.click('#login');
	}

	await page.waitForTimeout(2000);
	return loginBtnNotDisplay;
}
