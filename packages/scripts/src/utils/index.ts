import { $, AnswererWrapper, WorkUploadType } from '@ocsjs/core';
import { $ui, $message, $modal, MessageElement, h } from 'easy-us';
import { $console } from '../projects/background';
import { answerWrapperEmptyWarning } from './work';
import { MessageAttrs } from 'easy-us/lib/interfaces/custom-window';

export interface CommonWorkOptions {
	period: number;
	thread: number;
	upload: WorkUploadType;
	answererWrappers: AnswererWrapper[];
	stopSecondWhenFinish: number;
	redundanceWordsText: string;
	answerSeparators: string;
}

/** 创建答题预处理信息 */
export function workPreCheckMessage(
	options: CommonWorkOptions & {
		start_delay_seconds?: number;
		onrun: (opts: CommonWorkOptions) => void;
		/**
		 * 当没有题库配置时的回调
		 */
		onNoAnswererWrappers?: (opts: CommonWorkOptions) => void;
		/**
		 * 手动关闭时的回调
		 */
		onclose?: (opts: CommonWorkOptions, closedMessage: MessageElement) => void;
	}
) {
	const { onrun, onNoAnswererWrappers, onclose, ...opts } = options;

	if (opts.answererWrappers.length === 0) {
		onNoAnswererWrappers?.(opts);
		return answerWrapperEmptyWarning(0);
	} else {
		options.start_delay_seconds = options.start_delay_seconds ?? 5;
		return $message.info({
			duration: options.start_delay_seconds,
			content: h('span', [
				`${options.start_delay_seconds}秒后自动答题，`,
				$ui.preventText({
					name: '点击取消',
					delay: options.start_delay_seconds,
					ondefault: (span) => {
						onrun(opts);
					},
					onprevent(span) {
						const closedMessage = $message.warn({
							content: '已关闭此次的自动答题，请手动开启或者忽略此警告。',
							duration: 0
						});
						if (closedMessage) {
							onclose?.(opts, closedMessage);
						}
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
export async function playMedia(playFunction: () => Promise<void> | undefined | void): Promise<boolean> {
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
		return true;
	} catch (err) {
		console.error(err);
		if (String(err).includes(`failed because the user didn't interact with the document first`)) {
			$modal.alert({
				content:
					'播放音视频失败，由于浏览器的用户隐私保护措施，如果要播放带有音量的视频，或者某些无法自动播放音视频的网站，您必须先点击一次页面上的任意位置脚本才能进行音视频的播放，后续无需重新点击。',
				onClose: async () => {
					await tryPlayMedia();
				}
			});
			return true;
		} else if (String(err).includes('The element has no supported sources')) {
			$console.error('当前视频无法播放。');
		} else {
			$console.error('播放视频时发生未知错误：' + String(err));
		}
		return false;
	}
}

/**
 * 	解除复制限制功能
 * @param elements 要开启复制功能的元素
 */
export function enableCopy(elements: (HTMLElement | Document)[]) {
	// 将页面上的所有选择方法劫持，并强制返回 true
	function hackSelect(target: HTMLElement | Document) {
		if (target) {
			const _original_select = target.onselectstart;
			const _original_oncopy = target.oncopy;
			const _original_onpaste = target.onpaste;
			const _original_onkeydown = target.onkeydown;

			target.onselectstart = (e: any) => {
				_original_select?.apply(target, [e]);
				e.stopPropagation();
				e.returnValue = true;
				return true;
			};
			target.oncopy = (e: any) => {
				_original_oncopy?.apply(target, [e]);
				e.stopPropagation();
				e.returnValue = true;
				return true;
			};
			target.onpaste = (e: any) => {
				_original_onpaste?.apply(target, [e]);
				e.stopPropagation();
				e.returnValue = true;
				return true;
			};
			target.onkeydown = (e: any) => {
				_original_onkeydown?.apply(target, [e]);
				e.stopPropagation();
				e.returnValue = true;
				return true;
			};
		}
	}

	for (const el of elements) {
		hackSelect(el);
	}
}

let popupWin: Window | null;
window.addEventListener('beforeunload', () => {
	popupWin?.close();
});
/**
 * 创建关于问题题目的拓展功能按钮，包括复制和百度一下
 * @param question 问题
 */
/**
 * 题目区域的额外操作行（右对齐，按钮统一为项目通用按钮样式）。
 * @param question 题目文本（复制/搜索用）
 * @param left 需要放在"复制"按钮左侧的元素（如题型标签），避免独占一行高度
 */
export function createQuestionTitleExtra(question: string, ...left: HTMLElement[]) {
	/**
	 * 通用次要按钮样式 + 原有紧凑尺寸。
	 * 注意必须用 flex 居中而非 line-height：appearance:none 后 input 文本垂直位置由字体
	 * metrics 决定（line-height:normal 随字体变化），不同页面字体下文本会上下偏移；
	 * line-height:1 + flex 居中与字体无关，且避免 emoji 行盒撑高按钮。
	 */
	const btnAttrs = {
		className: 'base-style-button-secondary',
		style: {
			padding: '0 4px',
			fontSize: '12px',
			height: '20px',
			lineHeight: '1',
			display: 'inline-flex',
			alignItems: 'center',
			justifyContent: 'center'
		}
	};
	/** 复制题目按钮（点击后短暂显示反馈） */
	const copyBtn = $ui.button('复制', btnAttrs);
	copyBtn.onclick = () => {
		navigator.clipboard.writeText(question);
		copyBtn.value = '已复制√';
		setTimeout(() => {
			copyBtn.value = '复制';
		}, 500);
	};
	/** 百度搜题按钮 */
	const baiduBtn = $ui.button('🌏百度一下', btnAttrs);
	baiduBtn.onclick = () => {
		popupWin?.close();
		popupWin = $.createCenteredPopupWindow(`https://www.baidu.com/s?wd=${question}`, '百度搜索', {
			width: 1000,
			height: 800,
			resizable: true,
			scrollbars: true
		});
	};

	const space = $ui.space([...left, copyBtn, baiduBtn], { x: 4 });
	space.style.marginTop = '6px';
	space.style.textAlign = 'right';
	return h('div', { style: { textAlign: 'right' } }, [space]);
}

function msg(type: keyof typeof $message, attrs: MessageAttrs) {
	$message[type](attrs);
	if (type === 'success') {
		type = 'info';
	}
	let content = '';
	if (typeof attrs === 'string') {
		content = attrs;
	} else {
		if (attrs.content instanceof HTMLElement) {
			content = attrs.content.innerText;
		} else if (typeof attrs.content === 'string') {
			content = attrs.content.toString();
		}
	}
	$console[type](content);
}

export const $msg = {
	/**  输出气泡消息以及日志记录  */
	info: (attrs: MessageAttrs) => msg('info', attrs),
	/**  输出气泡消息以及日志记录  */
	warn: (attrs: MessageAttrs) => msg('warn', attrs),
	/**  输出气泡消息以及日志记录  */
	error: (attrs: MessageAttrs) => msg('error', attrs),
	/**  输出气泡消息以及日志记录  */
	success: (attrs: MessageAttrs) => msg('success', attrs)
};
