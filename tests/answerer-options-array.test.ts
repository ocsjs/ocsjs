/**
 * 题库 ${optionsArray} 占位符测试
 *
 * 验证题库配置中可以使用 ${optionsArray} 直接拿到结构化选项数组：
 *
 * - POST 请求：整个字段值为 ${optionsArray} 时，提交数组本身
 * - GET 请求：整个字段值为 ${optionsArray} 时，提交 JSON 字符串
 * - 内嵌在字符串中的 ${optionsArray} 序列化为 JSON 字符串
 * - 调用方未显式提供 optionsArray 时，由 options 按换行自动推导
 * - 调用方显式提供 optionsArray 时以调用方为准
 *
 * 运行：tsx tests/answerer-options-array.test.ts
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

interface Received {
	query: URLSearchParams;
	body: any;
}

async function main() {
	// 该测试在 node 环境中运行，需要先模拟浏览器全局对象再加载 core 模块
	browserEnv();
	const { defaultAnswerWrapperHandler, AnswerWrapperHandlerConfig } = await import(
		'../packages/core/src/core/answer-wrapper/answer.wrapper.handler'
	);

	// 收窄超时，避免测试进程被搜题超时计时器拖住
	AnswerWrapperHandlerConfig.timeout_seconds = 3;

	const received: Received[] = [];
	const server = http.createServer((req, res) => {
		let raw = '';
		req.on('data', (chunk) => (raw += chunk));
		req.on('end', () => {
			received.push({
				query: new URL(req.url || '/', 'http://localhost').searchParams,
				body: raw ? JSON.parse(raw) : undefined
			});
			res.setHeader('content-type', 'application/json');
			res.end(JSON.stringify({ ok: true }));
		});
	});

	const port = await new Promise<number>((resolve) => {
		server.listen(0, () => resolve((server.address() as { port: number }).port));
	});

	const makeWrapper = (data: Record<string, any>, method: 'get' | 'post' = 'post'): AnswererWrapper => ({
		url: `http://localhost:${port}/search`,
		name: 'bank',
		method,
		type: 'fetch',
		contentType: 'json',
		headers: {},
		data,
		handler: 'return () => undefined'
	});

	console.log('\n  POST 请求：${optionsArray} 提交数组本身');
	{
		received.length = 0;
		await defaultAnswerWrapperHandler([makeWrapper({ title: '${title}', options: '${optionsArray}' })], {
			title: '测试题目',
			options: '选项A\n选项B\n选项C'
		});

		check(
			'服务端收到 JSON 数组',
			Array.isArray(received[0]?.body?.options),
			`实际 ${JSON.stringify(received[0]?.body?.options)}`
		);
		check(
			'数组内容与选项一致',
			JSON.stringify(received[0]?.body?.options) === JSON.stringify(['选项A', '选项B', '选项C'])
		);
		check('普通字符串占位符仍然生效', received[0]?.body?.title === '测试题目');
	}

	console.log('\n  GET 请求：${optionsArray} 提交 JSON 字符串');
	{
		received.length = 0;
		await defaultAnswerWrapperHandler([makeWrapper({ options: '${optionsArray}' }, 'get')], {
			title: '测试题目',
			options: 'A\nB'
		});

		check(
			'查询参数为 JSON 字符串',
			received[0]?.query.get('options') === JSON.stringify(['A', 'B']),
			`实际 ${received[0]?.query.get('options')}`
		);
	}

	console.log('\n  内嵌占位符：序列化为 JSON 字符串');
	{
		received.length = 0;
		await defaultAnswerWrapperHandler([makeWrapper({ options: 'list=${optionsArray}' })], {
			title: '测试题目',
			options: 'A\nB'
		});

		check(
			'内嵌占位符被替换为 JSON 字符串',
			received[0]?.body?.options === 'list=' + JSON.stringify(['A', 'B']),
			`实际 ${received[0]?.body?.options}`
		);
	}

	console.log('\n  调用方显式提供的 optionsArray 优先');
	{
		received.length = 0;
		await defaultAnswerWrapperHandler([makeWrapper({ options: '${optionsArray}' })], {
			title: '测试题目',
			options: 'A\nB',
			optionsArray: ['显式1', '显式2', '显式3']
		});

		check(
			'使用显式提供的数组',
			JSON.stringify(received[0]?.body?.options) === JSON.stringify(['显式1', '显式2', '显式3'])
		);
	}

	console.log('\n  无选项（填空题）时为空数组');
	{
		received.length = 0;
		await defaultAnswerWrapperHandler([makeWrapper({ options: '${optionsArray}' })], {
			title: '填空题',
			options: ''
		});

		check(
			'空选项推导为空数组',
			JSON.stringify(received[0]?.body?.options) === '[]',
			`实际 ${JSON.stringify(received[0]?.body?.options)}`
		);
	}

	await new Promise<void>((resolve) => server.close(() => resolve()));
	if (server.closeAllConnections) server.closeAllConnections();

	console.log(`\n  ✅ ${pass} 通过    ${fail} 失败   共 ${pass + fail} 项\n`);
	process.exitCode = fail === 0 ? 0 : 1;
}

main();
