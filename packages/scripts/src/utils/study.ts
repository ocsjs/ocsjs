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
			}, 1000);
		}),
		$.sleep(3 * 60 * 1000)
	]);
	if (res) {
		return res;
	} else {
		throw new Error('视频/音频未找到，或者加载超时。');
	}
}
