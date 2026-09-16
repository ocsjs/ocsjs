/**
 * 多题库搜题模式测试
 *
 * 验证 defaultAnswerWrapperHandler 的两种搜题模式：
 *
 * - sequential（默认）：按照题库配置顺序依次请求，命中答案后立即停止，
 *   并在检索信息中记录剩余题库，供「答案无法匹配选项」时继续尝试。
 * - parallel：同时请求所有题库并合并结果（原有行为）。
 *
 * 运行：tsx tests/answerer-search-mode.test.ts
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
	// 该测试在 node 环境中运行，需要先模拟浏览器全局对象再加载 core 模块
	browserEnv();
	const { defaultAnswerWrapperHandler, AnswerWrapperHandlerConfig } = await import(
		'../packages/core/src/core/answer-wrapper/answer.wrapper.handler'
	);

	// 收窄超时，避免测试进程被搜题超时计时器拖住
	AnswerWrapperHandlerConfig.timeout_seconds = 3;

	const calls: string[] = [];
	const server = http.createServer((req, res) => {
		const url = new URL(req.url || '/', 'http://localhost');
		const bank = url.searchParams.get('bank') || 'unknown';
		calls.push(bank);
		res.setHeader('content-type', 'application/json');
		// 题库一返回答案，题库二、三返回另一个答案；题库 empty 返回空
		const answer = bank === 'empty' ? '' : bank === 'bank1' ? 'A' : 'B';
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

	const env = { title: '测试题目', type: 'single', options: 'A\nB' };

	console.log('\n  顺序搜题模式（sequential）');
	{
		calls.length = 0;
		AnswerWrapperHandlerConfig.search_mode = 'sequential';
		const infos = await defaultAnswerWrapperHandler(
			[makeWrapper('bank1'), makeWrapper('bank2'), makeWrapper('bank3')],
			env
		);

		check('仅请求到第一个命中题库就停止', calls.length === 1, `实际请求次数 ${calls.length}: ${calls.join(',')}`);
		check('返回第一个题库的结果', infos.length === 1 && infos[0].name === 'bank1');
		check('结果中保存剩余题库用于后续重试', (infos[0]._remainingWrappers || []).length === 2);
		check('结果中保存搜题上下文', infos[0]._searchEnv === env);
	}

	console.log('\n  顺序搜题模式：前面的题库未命中时继续向后搜索');
	{
		calls.length = 0;
		AnswerWrapperHandlerConfig.search_mode = 'sequential';
		const infos = await defaultAnswerWrapperHandler(
			[makeWrapper('empty'), makeWrapper('bank2'), makeWrapper('bank3')],
			env
		);

		check('跳过无答案题库后命中', calls.join(',') === 'empty,bank2', `实际 ${calls.join(',')}`);
		check('命中结果来自第二个题库', infos[infos.length - 1].name === 'bank2');
		check('剩余题库只包含命中题库之后的', (infos[infos.length - 1]._remainingWrappers || []).length === 1);
	}

	console.log('\n  并行搜题模式（parallel，保持原有行为）');
	{
		calls.length = 0;
		AnswerWrapperHandlerConfig.search_mode = 'parallel';
		const infos = await defaultAnswerWrapperHandler(
			[makeWrapper('bank1'), makeWrapper('bank2'), makeWrapper('bank3')],
			env
		);

		check('请求了全部题库', calls.length === 3, `实际请求 ${calls.join(',')}`);
		check('合并返回了全部题库结果', infos.length === 3);
		check(
			'并行模式不记录剩余题库',
			infos.every((i) => i._remainingWrappers === undefined)
		);
	}

	await new Promise<void>((resolve) => server.close(() => resolve()));
	if (server.closeAllConnections) server.closeAllConnections();

	console.log(`\n  ✅ ${pass} 通过    ${fail} 失败   共 ${pass + fail} 项\n`);
	process.exitCode = fail === 0 ? 0 : 1;
}

main();
