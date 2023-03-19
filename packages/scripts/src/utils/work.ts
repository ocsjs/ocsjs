import { $creator, $message, OCSWorker, Script, SimplifyWorkResult, StringUtils, WorkResult, el } from '@ocsjs/core';
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
export function optimizationTextWithImage(root: HTMLElement) {
	if (root) {
		const el = root.cloneNode(true) as HTMLElement;

		for (const img of Array.from(el.querySelectorAll('img'))) {
			img.after(img.src);
		}

		return el.innerText;
	} else {
		return '';
	}
}

/** 将 {@link WorkResult} 转换成 {@link SimplifyWorkResult} */
export function simplifyWorkResult(results: WorkResult<any>[]): SimplifyWorkResult[] {
	const res: SimplifyWorkResult[] = [];

	for (const wr of results) {
		res.push({
			requesting: wr.requesting,
			resolving: wr.resolving,
			error: wr.error,
			question: StringUtils.of(
				wr.ctx?.elements.title
					?.filter(Boolean)
					?.map((t) => optimizationTextWithImage(t as HTMLElement))
					.join(',') || ''
			)
				.toString()
				/** cx新版题目冗余 */
				.replace(/\d+\.\s*\((.+题|名词解释|完形填空|阅读理解), .+分\)/, '')
				/** cx旧版题目冗余 */
				.replace(/[[|(|【|（]..题[\]|)|】|）]/, ''),
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
