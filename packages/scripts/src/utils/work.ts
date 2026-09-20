import {
	SimplifyWorkResult,
	WorkerEvents,
	WorkResult,
	defaultAnswerWrapperHandler,
	AnswererWrapper,
	SearchInformation,
	WorkContext,
	$
} from '@ocsjs/core';
import { $ui, $message, MessageElement, Script, h, CommonEventEmitter, cors, $elements } from 'easy-us';
import { CommonProject } from '../projects/common';
import { BackgroundProject } from '../projects/background';
import { CommonWorkOptions, workPreCheckMessage } from '.';
import {
	buildAnswererEnv,
	createImageSuggestion,
	imageToBase64,
	ImageSuggestionResult,
	isAnswererWrappersSupportImageOptimize
} from './answerer-env';

// 重新导出，保持对外 API 不变（common.ts / exploration.ts 等仍从本文件导入）
export { buildAnswererEnv, createImageSuggestion, imageToBase64, isAnswererWrappersSupportImageOptimize };
export type { ImageSuggestionResult };
// extractTextWithImages / ExtractTextOptions 已在下方直接 export

export let globalControlPanel: HTMLElement | null = null;

/**
 * 通用作业考试工具方法
 */
export function commonWork(
	script: Script,
	options: {
		start_delay_seconds?: number;
		enable_control_panel?: boolean;
		workerProvider: (opts: CommonWorkOptions) => CommonEventEmitter<WorkerEvents> | undefined;
		beforeRunning?: () => void | Promise<void>;
		onRestart?: () => void | Promise<void>;
		onWorkerCreated?: (worker: CommonEventEmitter<WorkerEvents>) => void | Promise<void>;
	}
) {
	// 置顶当前脚本
	BackgroundProject.scripts.render.methods.pin(script);
	let worker: CommonEventEmitter<WorkerEvents> | undefined;

	/**
	 * 是否已经按下了开始按钮
	 */
	let startBtnPressed = false;
	/**
	 * 是否检查失败
	 */
	let checkFailed = false;

	/**
	 * 是否正在运行
	 */
	let running = false;

	/** 显示答题控制按钮 */
	const createWorkControlPanel = () => {
		const { controlBtn, restartBtn, startBtn } = createWorkerControl({
			workerProvider: () => worker,
			onStart: async () => {
				startBtnPressed = true;
				if (checkMessage instanceof MessageElement) {
					checkMessage.remove();
				}
				await closeAnswerWrapperEmptyWarning();
				start();
			},
			onRestart: async () => {
				worker?.emit('close');
				await options.onRestart?.();
				start();
			}
		});

		startBtn.style.flex = '1';
		startBtn.style.padding = '4px';
		restartBtn.style.flex = '1';
		restartBtn.style.padding = '4px';
		controlBtn.style.flex = '1';
		controlBtn.style.padding = '4px';

		const container = h(
			'div',
			{ style: { marginTop: '12px', display: 'flex' } },
			running ? [controlBtn, restartBtn] : [startBtn]
		);

		globalControlPanel = container;

		return { container, startBtn, restartBtn, controlBtn };
	};
	const workResultPanel = () => CommonProject.scripts.workResults.methods.createWorkResultsPanel();

	const sync_script = [script];
	if (options.enable_control_panel) {
		sync_script.push(CommonProject.scripts.workResults);
	}

	for (const script of sync_script) {
		script.on('render', () => {
			let gotoSettingsBtnContainer: string | HTMLElement = '';
			if (checkFailed) {
				const gotoSettingsBtn = $ui.button('👉 前往设置题库配置', {
					className: 'base-style-button',
					style: { flex: '1', padding: '4px' }
				});
				gotoSettingsBtn.style.flex = '1';
				gotoSettingsBtn.style.padding = '4px';
				gotoSettingsBtn.onclick = () => {
					BackgroundProject.scripts.render.methods.pin(CommonProject.scripts.settings);
				};
				gotoSettingsBtnContainer = h('div', { style: { display: 'flex' } }, [gotoSettingsBtn]);
			}

			script.panel?.body?.replaceChildren(
				h('div', { style: { marginTop: '12px' } }, [
					gotoSettingsBtnContainer,
					...(options.enable_control_panel ? [globalControlPanel || createWorkControlPanel().container] : []),
					workResultPanel()
				])
			);
		});
	}

	const workOptions = CommonProject.scripts.settings.methods.getWorkOptions();

	/**
	 * 检查题库是否配置，并询问是否开始答题
	 */
	let checkMessage = workPreCheckMessage({
		onrun: () => startBtnPressed === false && start(),
		onclose: (_, closedMsg) => (checkMessage = closedMsg),
		onNoAnswererWrappers: () => {
			checkFailed = true;
		},
		...workOptions,
		start_delay_seconds: options.start_delay_seconds
	});

	const start = async () => {
		await options.beforeRunning?.();
		running = true;
		worker = options.workerProvider(workOptions);

		if (worker) {
			options.onWorkerCreated?.(worker);
		}

		const { container, controlBtn } = createWorkControlPanel();
		// 更新状态
		script.panel?.body?.replaceChildren(container, workResultPanel());

		worker?.once('done', () => {
			running = false;
			globalControlPanel = null;
			controlBtn.disabled = true;
		});
	};
}

/**
 * 答题控制
 */
export function createWorkerControl(options: {
	workerProvider: () => CommonEventEmitter<WorkerEvents> | undefined;
	onStart: () => void;
	onRestart: () => void;
}) {
	let stop = false;
	let stopMessage: MessageElement | undefined;
	const startBtn = $ui.button('▶️开始答题');
	const restartBtn = $ui.button('🔃重新答题');
	const controlBtn = $ui.button('⏸暂停');

	startBtn.onclick = () => {
		startBtn.remove();
		options.onStart();
	};
	restartBtn.onclick = () => {
		// 重新答题时，清除暂停提示
		stopMessage?.remove();
		options.onRestart();
	};
	controlBtn.onclick = () => {
		stop = !stop;
		const worker = options.workerProvider();
		worker?.emit?.(stop ? 'stop' : 'continuate');
		controlBtn.value = stop ? '▶️继续' : '⏸️暂停';
		if (stop) {
			stopMessage = $message.warn({ duration: 0, content: '暂停中...' });
		} else {
			stopMessage?.remove();
		}
	};

	return { startBtn, restartBtn, controlBtn };
}

/**
 * 结构化 DOM 遍历：提取文本与图片 URL。
 *
 * 替代旧的 `optimizationElementWithImage(...).innerText` 链路：
 * - 不改造 DOM、不读 innerText、不用正则。
 * - `text` 产出原始 URL 文本（URL 两侧加空格分隔，避免相邻 URL 拼接）。
 * - `images` 额外返回按文档顺序的 URL 数组，供 createImageSuggestion 跳过正则。
 * - 跳过 `display:none` 的元素（模拟 innerText 对非渲染节点的跳过）。
 * - 对 detached 元素（如 zhs 由 JSON HTML 构建的 div）同样适用。
 */
export interface ExtractTextOptions {
	/** 仅收集满足条件的 img（如 zhs 选项需排除按钮图片） */
	imgFilter?: (img: HTMLImageElement) => boolean;
}
export function extractTextWithImages(
	root: HTMLElement,
	opts?: ExtractTextOptions
): { text: string; images: string[] } {
	const parts: string[] = [];
	const images: string[] = [];
	const walk = (node: Node) => {
		if (node.nodeType === Node.TEXT_NODE) {
			parts.push(node.textContent || '');
			return;
		}
		if (node.nodeType !== Node.ELEMENT_NODE) return;
		const el = node as HTMLElement;
		if (el.tagName === 'IMG') {
			const img = el as HTMLImageElement;
			if (opts?.imgFilter && !opts.imgFilter(img)) return;
			const url = img.src;
			if (url) {
				parts.push(` ${url} `);
				images.push(url);
			}
			return;
		}
		if (el.tagName === 'BR') {
			parts.push('\n');
			return;
		}
		// 跳过 display:none（仅对已挂载元素；detached 元素 getComputedStyle 返回空，不跳过）
		try {
			const view = el.ownerDocument?.defaultView;
			if (view && el.isConnected && view.getComputedStyle(el).display === 'none') return;
		} catch {
			// 忽略
		}
		for (const child of Array.from(el.childNodes)) walk(child);
	};
	walk(root);
	return { text: parts.join(''), images };
}

/** 将 {@link WorkResult} 转换成 {@link SimplifyWorkResult} */
export function simplifyWorkResult(
	results: WorkResult<any>[],
	/**
	 * 标题处理方法
	 * 在答题时使用相同的处理方法，可以使答题结果显示的题目与搜题的题目保持一致
	 */
	titleTransform?: (title: (HTMLElement | undefined)[], index: number) => string
): SimplifyWorkResult[] {
	const res: SimplifyWorkResult[] = [];
	let i = 0;
	for (const wr of results) {
		const ques =
			titleTransform?.(wr.ctx?.elements.title || [], i) ||
			wr.ctx?.elements.title
				?.map((e) => e?.innerText.trim())
				.filter(Boolean)
				.join('<br>') ||
			'';
		res.push({
			requested: wr.requested,
			resolved: wr.resolved,
			error: wr.error,
			type: wr.ctx?.type,
			question: ques,
			finish: wr.result?.finish,
			searchInfos:
				wr.ctx?.searchInfos.map((sr) => ({
					error: sr.error,
					name: sr.name,
					homepage: sr.homepage,
					results: sr.results.map((ans) => [ans.question, ans.answer, ans.extra_data || {}])
				})) || []
		});
		i++;
	}

	return res;
}

/**
 * 从题目中移除指定的冗余词
 */
export function removeRedundantWords(str: string, words: string[]) {
	for (const word of words.map((w) => w.trim())) {
		str = str.replace(word, '');
	}
	return str;
}

let answererWrapperUnsetMessage: MessageElement | undefined;

export const answerWrapperEmptyWarning = cors.defineTopFunction((duration: number) => {
	const setting = h('button', { className: 'base-style-button-secondary' }, '通用-全局设置');
	setting.onclick = () => {
		BackgroundProject.scripts.render.methods.pin(CommonProject.scripts.settings);
		setTimeout(() => {
			$elements.root?.querySelector<HTMLElement>('[value="点击配置"]')?.click();
		}, 500);
	};

	answererWrapperUnsetMessage?.remove();
	answererWrapperUnsetMessage = $message.warn({
		content: h('span', {}, ['你还没设置题库，无法自动答题，请切换到 ', setting, ' 页面进行配置。']),
		duration: duration
	});
});

export const closeAnswerWrapperEmptyWarning = cors.defineTopFunction(() => {
	answererWrapperUnsetMessage?.remove();
	answererWrapperUnsetMessage = undefined;
});

/**
 * 创建通用的 answerer 回调，封装搜题缓存、延迟、env 构建、AI 图片建议等公共逻辑
 * @param options.titleTransform 标题转换函数，接收 (elements, ctx)，返回字符串标题
 * @param options.optionsTransform 选项转换函数（可选），接收 (elements, ctx)，返回选项文本字符串；
 *   默认取 ctx.elements.options 的 innerText 拼接
 * @param options.answererWrappers 题库配置
 * @param options.period 搜题间隔（秒），默认 3
 */
export function createCommonAnswerer(options: {
	titleTransform: (elements: any, ctx: WorkContext<any>) => string | { text: string; images?: string[] };
	optionsTransform?: (elements: any, ctx: WorkContext<any>) => string | { text: string; images?: string[] };
	answererWrappers: AnswererWrapper[];
	period?: number;
}) {
	const normalize = (v: string | { text: string; images?: string[] } | undefined): { text: string; images?: string[] } => {
		if (v == null) return { text: '' };
		return typeof v === 'string' ? { text: v } : v;
	};
	/** 题目文本中的图片 URL 快速检测（仅用于降级提示，非精确提取；无 /g 标志，test 调用安全） */
	const QUESTION_IMAGE_REGEX = /https?:\/\/[^\s]+?\.(?:png|jpe?g|gif|bmp|webp|svg)/i;
	/** 降级提示仅每次会话提示一次，避免逐题刷屏 */
	let imageOptimizeOffWarned = false;
	let imageConvertFailWarned = false;

	return async (elements: any, ctx: WorkContext<any>): Promise<SearchInformation[]> => {
		const titleResult = normalize(options.titleTransform(elements, ctx));
		const title = titleResult.text;
		if (!title) {
			throw new Error('题目为空，请查看题目是否为空，或者忽略此题');
		}
		const titleImages = titleResult.images;

		return BackgroundProject.scripts.apps.methods.searchAnswerInCaches(title, async () => {
			await $.sleep((options.period ?? 3) * 1000);
			const optResult = normalize(
				options.optionsTransform
					? options.optionsTransform(elements, ctx)
					: (ctx.elements.options ?? [])
							.filter(Boolean)
							.map((o: HTMLElement | undefined) => o!.innerText)
							.join('\n')
			);
			const questionHasImages =
				(titleImages?.length ?? 0) + (optResult.images?.length ?? 0) > 0 ||
				QUESTION_IMAGE_REGEX.test(title) ||
				QUESTION_IMAGE_REGEX.test(optResult.text);
			// 题目含图片但未开启图片题优化：此前为静默降级（原始 URL 发出后大概率搜不到），显式提示用户开启
			if (questionHasImages && !CommonProject.scripts.settings.cfg.imageOptimize && !imageOptimizeOffWarned) {
				imageOptimizeOffWarned = true;
				$message.warn({
					content: '检测到题目包含图片，但未开启「图片题优化」（通用-全局设置-高级设置中开启），图片题将无法搜题。',
					duration: 10
				});
			}
			const { env, imageUrls } = await buildAnswererEnv({
				type: ctx.type,
				title,
				options: optResult.text,
				titleImages,
				optionsImages: optResult.images,
				enableImageOptimize: CommonProject.scripts.settings.cfg.imageOptimize
			});
			// 已开启优化但全部图片转换失败（CORS/防盗链极端情况）：此前静默回退普通题，显式提示
			if (
				questionHasImages &&
				CommonProject.scripts.settings.cfg.imageOptimize &&
				imageUrls.length === 0 &&
				!imageConvertFailWarned
			) {
				imageConvertFailWarned = true;
				$message.warn({
					content: '题目图片下载或转换失败（可能跨域受限），本题将按普通题目搜索，图片题可能无法匹配。',
					duration: 10
				});
			}
			const searchInfos = await defaultAnswerWrapperHandler(options.answererWrappers, env);
			// 将 AI 答案中的 [图片N] 占位符还原为对应图片 URL，使选项匹配可以命中图片选项。
			// imageUrls 与实际上传的 env.images 严格同序（createImageSuggestion 单一数据源，含转换失败过滤）。
			// 覆盖服务端未还原的场景：标题图占位符 / 选项行数不对齐 / 第三方题库。
			if (imageUrls.length) {
				for (const info of searchInfos) {
					for (const res of info.results) {
						if (res.answer && res.answer.includes('[图片')) {
							res.answer = res.answer.replace(/\[图片(\d+)\]/g, (m, n) => imageUrls[Number(n) - 1] ?? m);
						}
					}
				}
			}
			return searchInfos;
		});
	};
}
