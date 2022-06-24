import { domSearch, domSearchAll, sleep } from '../../core/utils';
import { logger } from '../../logger';
import { message } from '../../main';
import { useContext, useSettings } from '../../store';
import { waitForCaptcha } from './utils';

let stop = false;

/**
 * zhs 视频学习
 */
export async function study() {
	const { watchTime, restudy } = useSettings().zhs.video;
	logger('info', 'zhs 学习任务开始');
	/** 查找任务 */
	let list: HTMLLIElement[] = Array.from(document.querySelectorAll('li.clearfix.video'));

	/** 如果不是复习模式，则排除掉已经完成的任务 */
	if (!restudy) {
		list = list.filter((el) => el.querySelector('.time_icofinish') === null);
	}

	if (list.length === 0) {
		logger('warn', '视频任务数量为 0 !');
	} else {
		console.log(list);

		logger('info', '视频任务数量', list.length);

		/**
		 * 实时监测，关闭弹窗测验
		 */
		setInterval(() => {
			const { showProgress } = useSettings().zhs.video;
			closeTestDialog();
			fixedVideoProgress(showProgress);
		}, 3000);

		/**
		 * 到达学习时间后，自动关闭
		 */
		autoClose(watchTime);

		/** 遍历任务进行学习 */
		for (const item of list) {
			try {
				if (stop) {
					break;
				} else {
					logger(
						'debug',
						`即将播放 -- ${item.querySelector('[class="catalogue_title"]')?.getAttribute('title')} : ${
							item.querySelector('.time')?.textContent
						}`
					);
					item.click();
					await sleep(5000);
					await watch();
				}
			} catch (e) {
				logger('error', e);
			}
		}
	}

	logger('info', 'zhs 学习任务结束');
}

/**
 * 观看视频
 * @param setting
 * @returns
 */
export async function watch() {
	const { volume, playbackRate, creditStudy } = useSettings().zhs.video;

	return new Promise<void>((resolve, reject) => {
		try {
			const video = document.querySelector('video') as HTMLVideoElement;
			const { common } = useContext();
			// 保存视频元素
			common.currentMedia = video;

			// 设置当前视频
			common.currentMedia = video;
			// 如果已经播放完了，则重置视频进度
			video.currentTime = 0;
			// 音量
			video.volume = volume;

			Promise.resolve(async () => {
				await sleep(1000);

				video.play();
				// 设置播放速度
				await switchPlaybackRate(creditStudy ? 1 : playbackRate);

				video.onpause = async function () {
					if (!video.ended) {
						if (stop) {
							resolve();
						} else {
							await waitForCaptcha();
							await sleep(1000);
							video.play();
						}
					}
				};
				video.onended = function () {
					resolve();
				};
			})
				.then((func) => {
					func();
				})
				.catch((err) => {
					logger('error', err);
				});
		} catch (e) {
			reject(e);
		}
	});
}

/**
 * 切换播放速度
 * @param playbackRate 播放速度
 */
export async function switchPlaybackRate(playbackRate: number) {
	await sleep(500);
	const { btn } = domSearch({ btn: '.speedBox' });
	btn?.click();
	await sleep(500);
	const { rate } = domSearch({ rate: `[rate="${playbackRate === 1 ? '1.0' : playbackRate}"]` });
	rate?.click();
}

/**
 * 关闭zhs共享课测验弹窗
 */
export async function closeTestDialog() {
	const { items } = domSearchAll({ items: '.topic-item' });
	if (items.length !== 0) {
		const { item, btn } = domSearch({ item: '.topic-item', btn: '[aria-label="弹题测验"] .btn' });
		// 选择A
		item?.click();
		await sleep(1000);
		// 关闭
		btn?.click();
		await sleep(1000);
	}
}

/** 校内学分课 */
export async function creditStudy() {
	const { restudy } = useSettings().zhs.video;

	/** 查找任务 */
	let list: HTMLLIElement[] = Array.from(document.querySelectorAll('.file-item'));

	/** 如果不是复习模式，则排除掉已经完成的任务 */
	if (!restudy) {
		list = list.filter((el) => el.querySelector('.icon-finish') === null);
	}

	console.log(list);

	const item = list[0];
	if (item) {
		if (item.classList.contains('active')) {
			await watch();
			/** 下一章 */
			if (list[1]) list[1].click();
		} else {
			item.click();
		}
	}
}

/**
 * 到达学习时间后，自动关闭
 */
export function autoClose(watchTime: number) {
	const settings = useSettings().zhs.video;
	if (watchTime !== 0) {
		let time = 0;
		// 清空之前的计数器
		clearInterval(settings.interval);
		// 开始计时
		settings.interval = setInterval(() => {
			if (time >= watchTime * 60 * 60 * 1000) {
				clearInterval(settings.interval);
				const video: HTMLVideoElement = document.querySelector('video') as any;
				video.pause();
				stop = true;
				message('warn', '脚本已自动暂停，已获得今日平时分，如需继续学习请刷新页面并调整学习时间。');
			} else {
				time += 1000;
			}
		}, 1000);
	} else {
		// 清空的计数器
		clearInterval(settings.interval);
	}
}

/**
 * 永久固定显示视频进度
 */
export function fixedVideoProgress(fixed: boolean) {
	const { common } = useContext();
	const { bar } = domSearch({ bar: '.controlsBar' });
	if (common.currentMedia && bar) {
		if (bar) {
			bar.style.display = fixed ? 'block' : 'none';
		}
	}
}
