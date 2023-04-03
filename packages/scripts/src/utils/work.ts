import { $creator, $message, OCSWorker, Script, SimplifyWorkResult, WorkResult, el } from '@ocsjs/core';
import { workConfigs } from './configs';

/**
 * 答题控制
 */
export function createWorkerControl(
	script: Script<Omit<typeof workConfigs, 'upload'>>,
	getWorker: () => OCSWorker<any> | undefined
) {
	const worker = getWorker();
	let stop = true;
	const startBtn = $creator.button('▶️开始答题');
	const restartBtn = $creator.button('↩️重新答题');
	const controlBtn = $creator.button('⏸️暂停答题');

	const stopMessage = $message('warn', { duration: 10, content: '暂停中...' });
	stopMessage.style.display = 'none';

	startBtn.onclick = () => {
		startBtn.remove();
		script.panel?.body.replaceChildren(el('hr'), restartBtn, controlBtn);
		script.event.emit('start');
	};
	restartBtn.onclick = () => script.event.emit('restart');
	controlBtn.onclick = () => {
		stop = !stop;
		const worker = getWorker();
		worker?.emit?.(stop ? 'continuate' : 'stop');
		controlBtn.value = stop ? '⏸️暂停答题' : '▶️继续答题';
		stopMessage.style.display = stop ? 'none' : 'display';
	};

	script.event.on('done', () => (controlBtn.disabled = true));

	if (script.panel) {
		script.panel.body.style.textAlign = 'right';
	}

	script.panel?.body.replaceChildren(el('hr'), ...(worker?.isRunning ? [restartBtn, controlBtn] : [startBtn]));
}

/**
 * 图片识别，将图片链接追加到 text 中
 */
export function optimizationElementWithImage(root: HTMLElement) {
	if (root) {
		const el = root.cloneNode(true) as HTMLElement;
		for (const img of Array.from(el.querySelectorAll('img'))) {
			img.after(img.src);
		}
		return el;
	}

	return root;
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
					error: sr.error?.message,
					name: sr.name,
					homepage: sr.homepage,
					results: sr.results.map((ans) => [ans.question, ans.answer])
				})) || []
		});
	}

	return res;
}
