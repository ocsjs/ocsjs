import { $ } from '@ocsjs/core';

/**
 * 等待视频加载并获取视频
 */
export async function waitForMedia(options?: {
	/**
	 * 视频选择器
	 */
	videoSelector?: string;
	/**
	 * 音频选择器
	 */
	audioSelector?: string;
	/**
	 * 根元素
	 */
	root?: HTMLElement | Document;
	timeout?: number;
}) {
	const res = await Promise.race([
		new Promise<HTMLVideoElement | HTMLAudioElement>((resolve, reject) => {
			const interval = setInterval(() => {
				const video = (options?.root || document).querySelector<HTMLVideoElement | HTMLAudioElement>(
					`${options?.videoSelector || 'video'},${options?.audioSelector || 'audio'}`
				);
				if (video) {
					clearInterval(interval);
					resolve(video);
				}
			}, 200);
		}),
		$.sleep(options?.timeout ?? 3 * 60 * 1000)
	]);
	if (res) {
		return res;
	} else {
		throw new Error('视频/音频未找到，或者加载超时。');
	}
}

export function waitForElement(selector: string) {
	return new Promise<HTMLElement | undefined>((resolve, reject) => {
		const interval = setInterval(() => {
			const el = document.querySelector<HTMLElement>(selector);
			if (el) {
				clearInterval(interval);
				clearTimeout(timeout);
				resolve(el);
			}
		}, 1000);

		// 超时跳过
		const timeout = setTimeout(() => {
			clearInterval(interval);
			resolve(undefined);
		}, 10 * 1000);
	});
}
