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
	CommonProject.scripts.render.methods.pin(script);
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
					CommonProject.scripts.render.methods.pin(CommonProject.scripts.settings);
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
 * 图片识别，将图片链接追加到 text 中
 * 返回一个克隆的节点
 */
export function optimizationElementWithImage(root: HTMLElement, clone_node: boolean = false): HTMLElement {
	const clone = clone_node ? (root.cloneNode(true) as HTMLElement) : root;
	for (const img of Array.from(clone.querySelectorAll('img'))) {
		// 如果已经存在识别结果，则不处理
		if (
			Array.from(img.parentElement!.querySelectorAll('span')).some(
				(e) => e.style.fontSize === '0px' && e.textContent?.includes(img.src)
			)
		) {
			continue;
		}

		const src = document.createElement('span');
		src.innerText = img.src;
		// 隐藏图片，但不影响 innerText 的获取
		src.style.fontSize = '0px';
		img.after(src);
	}
	return clone;
}

/**
 * 创建一个不可见的文本节点，追加到图片后面，便于文本获取
 */
export function createUnVisibleTextOfImage(img: HTMLImageElement) {
	const src = document.createElement('span');
	src.innerText = img.src;
	// 隐藏图片，但不影响 innerText 的获取
	src.style.fontSize = '0px';
	img.after(src);
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
		CommonProject.scripts.render.methods.pin(CommonProject.scripts.settings);
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
	titleTransform: (elements: any, ctx: WorkContext<any>) => string;
	optionsTransform?: (elements: any, ctx: WorkContext<any>) => string;
	answererWrappers: AnswererWrapper[];
	period?: number;
}) {
	return async (elements: any, ctx: WorkContext<any>): Promise<SearchInformation[]> => {
		const title = options.titleTransform(elements, ctx);
		if (!title) {
			throw new Error('题目为空，请查看题目是否为空，或者忽略此题');
		}

		return CommonProject.scripts.apps.methods.searchAnswerInCaches(title, async () => {
			await $.sleep((options.period ?? 3) * 1000);
			const opt = options.optionsTransform
				? options.optionsTransform(elements, ctx)
				: (ctx.elements.options ?? [])
						.filter(Boolean)
						.map((o: HTMLElement | undefined) => o!.innerText)
						.join('\n');
			const env = await buildAnswererEnv({
				type: ctx.type,
				title,
				options: opt,
				enableImageOptimize: CommonProject.scripts.settings.cfg.imageOptimize
			});
			return defaultAnswerWrapperHandler(options.answererWrappers, env);
		});
	};
}
