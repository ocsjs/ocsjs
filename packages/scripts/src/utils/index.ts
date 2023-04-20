import { $creator, $message, $modal, AnswererWrapper, WorkUploadType, el } from '@ocsjs/core';

export interface CommonWorkOptions {
	period: number;
	thread: number;
	upload: WorkUploadType;
	answererWrappers: AnswererWrapper[];
	stopSecondWhenFinish: number;
	redundanceWordsText: string;
}

/** 创建答题预处理信息 */
export function workPreCheckMessage(
	options: CommonWorkOptions & {
		onrun: (opts: CommonWorkOptions) => void;
		ondone?: (opts: CommonWorkOptions) => void;
	}
) {
	const { onrun, ondone, ...opts } = options;

	if (opts.answererWrappers.length === 0) {
		$modal('alert', { content: '检测到题库配置为空，无法自动答题，请前往全局设置页面进行配置。' });
		ondone?.(opts);
	} else {
		$message('info', {
			duration: 5,
			content: el('span', [
				'5秒后自动答题。并切换到“通用-搜索结果”。',
				$creator.preventText({
					name: '点击取消此次答题',
					delay: 5,
					ondefault: (span) => {
						onrun(opts);
					},
					onprevent(span) {
						$message('warn', { content: '已关闭此次的自动答题。' });
						ondone?.(opts);
					}
				})
			])
		});
	}
}

/**
 * 创造范围选择器的提示
 */
export function createRangeTooltip(
	input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
	defaultValue: string,
	transform: (val: string) => string
) {
	input.addEventListener('change', () => {
		input.setAttribute('data-title', transform(input.value || input.getAttribute('value') || defaultValue));
	});
	input.setAttribute('data-title', transform(input.value || input.getAttribute('value') || defaultValue));
}

// 有些网课会改变 media.play 方法，所以可能不是一个 promise
export async function playMedia(playFunction: () => Promise<void> | undefined) {
	//  尝试播放
	const tryPlayMedia = () => {
		return new Promise<void>((resolve, reject) => {
			try {
				const playRes = playFunction();
				if (playRes) {
					playRes.then(resolve).catch(reject);
				} else {
					resolve();
				}
			} catch (err) {
				reject(err);
			}
		});
	};

	try {
		await tryPlayMedia();
	} catch (err) {
		if (String(err).includes(`failed because the user didn't interact with the document first`)) {
			$modal('alert', {
				content:
					'由于浏览器保护限制，如果要播放带有音量的视频，您必须先点击页面上的任意位置才能进行视频的播放，如果想自动播放，必须先在设置页面静音，然后重新运行脚本。',
				onClose: async () => {
					await tryPlayMedia();
				}
			});
		}
	}
}
