/**
 * OCSWorker 顺序搜题重试测试
 *
 * 场景：顺序搜题模式下，某个题库虽然返回了答案，但答案无法匹配到页面选项。
 * 期望：自动使用剩余题库继续尝试，直到答案能正确匹配选项。
 *
 * 运行：tsx tests/worker-retry.test.ts
 */

import http from 'node:http';
import browserEnv from 'browser-env';
import type { AnswererWrapper } from '../packages/core/src/core/answer-wrapper/interface';

let pass = 0;
let fail = 0;

function check(title: string, condition: boolean, detail?: string) {
	if (condition) {
		pass++;
		console.log(`  ✅ ${title}`);
	} else {
		fail++;
		console.log(`  ❌ ${title}${detail ? ` — ${detail}` : ''}`);
	}
}

async function main() {
	browserEnv();
	const { OCSWorker } = await import('../packages/core/src/core/worker/worker');
	const { defaultAnswerWrapperHandler, AnswerWrapperHandlerConfig } = await import(
		'../packages/core/src/core/answer-wrapper/answer.wrapper.handler'
	);
	// jsdom 不实现 innerText，用 textContent 兜底（真实浏览器无此问题）
	Object.defineProperty(HTMLElement.prototype, 'innerText', {
		configurable: true,
		get() {
			return this.textContent;
		},
		set(v: string) {
			this.textContent = v;
		}
	});

	AnswerWrapperHandlerConfig.timeout_seconds = 3;
	AnswerWrapperHandlerConfig.search_mode = 'sequential';

	const calls: string[] = [];
	const server = http.createServer((req, res) => {
		const url = new URL(req.url || '/', 'http://localhost');
		const bank = url.searchParams.get('bank') || 'unknown';
		calls.push(bank);
		res.setHeader('content-type', 'application/json');
		// empty 返回空；bank1 返回无法匹配的文本；bank2 返回正确答案 B
		const answer = bank === 'empty' ? '' : bank === 'bank1' ? '这是一段完全无关的文本' : 'B';
		res.end(JSON.stringify({ answer }));
	});

	const port = await new Promise<number>((resolve) => {
		server.listen(0, () => resolve((server.address() as { port: number }).port));
	});

	const makeWrapper = (bank: string): AnswererWrapper => ({
		url: `http://localhost:${port}/search?bank=${bank}`,
		name: bank,
		method: 'get',
		type: 'fetch',
		contentType: 'json',
		headers: {},
		data: {},
		handler: 'return (res) => res.answer ? [res.answer, res.answer] : undefined'
	});

	document.body.innerHTML = `
		<div class="questionLi" id="q1">
			<h3>1. 测试单选题</h3>
			<div class="answerBg">
				<div class="answer_p">选项甲</div>
				<div class="answer_p">选项乙</div>
			</div>
			<input id="answertypeq1" value="0">
		</div>
	`;

	const clicked: string[] = [];
	document.querySelectorAll('.answer_p').forEach((el) => {
		el.addEventListener('click', () => clicked.push((el.textContent || '').trim()));
	});

	const runWorker = async (banks: string[], title: string) => {
		calls.length = 0;
		const worker = new OCSWorker({
			root: '.questionLi',
			elements: {
				title: 'h3',
				options: '.answer_p',
				type: 'input[id^="answertype"]'
			},
			thread: 1,
			answerSeparators: ['===', '#'],
			answerMatchMode: 'similar',
			answerer: (elements) =>
				defaultAnswerWrapperHandler(banks.map(makeWrapper), {
					type: 'single',
					title: (elements.title || []).map((t) => (t ? t.innerText : '')).join(','),
					options: (elements.options || []).map((o) => (o ? o.innerText : '')).join('\n')
				}),
			work: async (ctx) => {
				const options = ctx.elements.options as HTMLElement[];
				// 复刻 cx.ts 的默认处理器调用方式
				return await (await import('../packages/core/src/core/worker/question.resolver'))
					.createDefaultQuestionResolver(ctx)
					['single'](ctx.searchInfos, options, async (_type, _answer, option) => {
						option?.click();
					});
			}
		});
		const results = await worker.doWork();
		console.log(`\n  ${title}`);
		return results[0];
	};

	{
		clicked.length = 0;
		const result = await runWorker(['bank1', 'bank2'], '第一个题库答案无法匹配选项时，自动使用后续题库');
		check('一共请求了两个题库', calls.join(',') === 'bank1,bank2', `实际 ${calls.join(',')}`);
		check('最终答题结果为完成', result.result?.finish === true);
		check('点击了正确选项（乙）', clicked.includes('选项乙'), `实际点击 ${clicked.join(',')}`);
		check('搜索结果被替换为命中的题库', result.ctx?.searchInfos[0]?.name === 'bank2');
	}

	{
		clicked.length = 0;
		const result = await runWorker(['empty', 'bank1', 'bank2'], '前面题库为空、中间题库不匹配时，继续使用后续题库');
		check('跳过空题库并继续重试', calls.join(',') === 'empty,bank1,bank2', `实际 ${calls.join(',')}`);
		check('最终答题结果为完成', result.result?.finish === true);
		check('点击了正确选项（乙）', clicked.includes('选项乙'), `实际点击 ${clicked.join(',')}`);
	}

	await new Promise<void>((resolve) => server.close(() => resolve()));
	if (server.closeAllConnections) server.closeAllConnections();

	console.log(`\n  ✅ ${pass} 通过    ${fail} 失败   共 ${pass + fail} 项\n`);
	process.exitCode = fail === 0 ? 0 : 1;
}

main();
