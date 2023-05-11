import { $creator, $message, MessageElement, OCSWorker, Script, SimplifyWorkResult, WorkResult, el } from '@ocsjs/core';
import { CommonProject } from '../projects/common';
import { CommonWorkOptions, workPreCheckMessage } from '.';

/**
 * 通用作业考试工具方法
 */
export function commonWork(
	script: Script,
	options: {
		workerProvider: (opts: CommonWorkOptions) => OCSWorker<any> | undefined;
		beforeRunning?: () => void | Promise<void>;
		onRestart?: () => void | Promise<void>;
	}
) {
	// 置顶当前脚本
	CommonProject.scripts.render.methods.pin(script);

	let worker: OCSWorker<any> | undefined;
	/**
	 * 是否已经按下了开始按钮
	 */
	let startBtnPressed = false;
	/**
	 * 是否检查失败
	 */
	let checkFailed = false;

	/** 显示答题控制按钮 */
	const createControls = () => {
		const { controlBtn, restartBtn, startBtn } = createWorkerControl({
			workerProvider: () => worker,
			onStart: async () => {
				startBtnPressed = true;
				checkMessage?.remove();
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

		const container = el(
			'div',
			{ style: { marginTop: '12px', display: 'flex' } },
			worker?.isRunning ? [controlBtn, restartBtn] : [startBtn]
		);

		return { container, startBtn, restartBtn, controlBtn };
	};
	const workResultPanel = () => CommonProject.scripts.workResults.methods.createWorkResultsPanel();

	script.on('render', () => {
		let gotoSettingsBtnContainer: string | HTMLElement = '';
		if (checkFailed) {
			const gotoSettingsBtn = $creator.button('👉 前往设置题库配置', {
				className: 'base-style-button',
				style: { flex: '1', padding: '4px' }
			});
			gotoSettingsBtn.style.flex = '1';
			gotoSettingsBtn.style.padding = '4px';
			gotoSettingsBtn.onclick = () => {
				CommonProject.scripts.render.methods.pin(CommonProject.scripts.settings);
			};
			gotoSettingsBtnContainer = el('div', { style: { display: 'flex' } }, [gotoSettingsBtn]);
		}

		script.panel?.body?.replaceChildren(
			el('div', { style: { marginTop: '12px' } }, [
				gotoSettingsBtnContainer,
				createControls().container,
				workResultPanel()
			])
		);
	});

	// 使用 json 深拷贝，防止修改原始配置
	const workOptions: typeof CommonProject.scripts.settings.cfg = JSON.parse(
		JSON.stringify(CommonProject.scripts.settings.cfg)
	);
	/**
	 * 过滤掉被禁用的题库
	 */
	workOptions.answererWrappers = workOptions.answererWrappers.filter(
		(aw) => CommonProject.scripts.settings.cfg.disabledAnswererWrapperNames.find((daw) => daw === aw.name) === undefined
	);

	/**
	 * 检查题库是否配置，并询问是否开始答题
	 */
	let checkMessage = workPreCheckMessage({
		onrun: () => startBtnPressed === false && start(),
		onclose: (_, closedMsg) => (checkMessage = closedMsg),
		onNoAnswererWrappers: () => {
			checkFailed = true;
		},
		...workOptions
	});

	const start = async () => {
		await options.beforeRunning?.();
		worker = options.workerProvider(workOptions);

		const { container, controlBtn } = createControls();
		// 更新状态
		script.panel?.body?.replaceChildren(container, workResultPanel());

		worker?.once('done', () => {
			controlBtn.disabled = true;
		});
	};
}

/**
 * 答题控制
 */
export function createWorkerControl(options: {
	workerProvider: () => OCSWorker<any> | undefined;
	onStart: () => void;
	onRestart: () => void;
}) {
	let stop = false;
	let stopMessage: MessageElement | undefined;
	const startBtn = $creator.button('▶️开始答题');
	const restartBtn = $creator.button('🔃重新答题');
	const controlBtn = $creator.button('⏸暂停');

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
			stopMessage = $message('warn', { duration: 0, content: '暂停中...' });
		} else {
			stopMessage?.remove();
		}
	};

	return { startBtn, restartBtn, controlBtn };
}

/**
 * 图片识别，将图片链接追加到 text 中
 */
export function optimizationElementWithImage(root: HTMLElement) {
	if (root) {
		for (const img of Array.from(root.querySelectorAll('img'))) {
			const src = document.createElement('span');
			src.innerText = img.src;
			// 隐藏图片，但不影响 innerText 的获取
			src.style.fontSize = '0px';
			img.after(src);
		}
	}
	return root;
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
	titleTransform?: (title: (HTMLElement | undefined)[]) => string
): SimplifyWorkResult[] {
	const res: SimplifyWorkResult[] = [];

	for (const wr of results) {
		res.push({
			requesting: wr.requesting,
			resolving: wr.resolving,
			error: wr.error,
			question: titleTransform?.(wr.ctx?.elements.title || []) || wr.ctx?.elements.title?.join(',') || '',
			finish: wr.result?.finish,
			searchInfos:
				wr.ctx?.searchInfos.map((sr) => ({
					error: sr.error,
					name: sr.name,
					homepage: sr.homepage,
					results: sr.results.map((ans) => [ans.question, ans.answer])
				})) || []
		});
	}

	return res;
}

/**
 * 从题目中移除指定的冗余词
 */
export function removeRedundantWords(str: string, words: string[]) {
	for (const word of words) {
		str = str.replace(word, '');
	}
	return str;
}
