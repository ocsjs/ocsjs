import { message } from '../../main';

/**
 * 检测是否有验证码，并等待验证
 */

export function waitForCaptcha(): void | Promise<void> {
	const popup = document.querySelector('.yidun_popup');
	if (popup) {
		message('warn', '当前检测到验证码，请输入后方可继续运行。');
		return new Promise<void>((resolve, reject) => {
			const interval = setInterval(() => {
				const popup = document.querySelector('.yidun_popup');
				if (popup === null) {
					clearInterval(interval);
					resolve();
				}
			}, 1000);
		});
	}
}
