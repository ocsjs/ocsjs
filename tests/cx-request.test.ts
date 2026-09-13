/**
 * 超星音视频任务点上报协议测试（纯逻辑，不需要浏览器环境）
 *
 * npx tsx tests/cx-request.test.ts
 *
 * 校验的是「发包模式」里最容易写错、且错了也不报错（服务端只回 200 但不算完成）的部分：
 * enc 签名明文拼接顺序、上报 URL 字段顺序、上报点节奏、isPassed 判定、并发池上限。
 */

import md5 from 'md5';
import {
	buildEncPlain,
	buildReportUrl,
	extractMArg,
	isPassedBody,
	planPoints,
	runConcurrentPool
} from '../packages/scripts/src/projects/cx-request-core';

let pass = 0;
let fail = 0;

function ok(name: string, cond: boolean, detail?: string) {
	if (cond) {
		pass++;
		console.log(`  ✅ ${name}`);
	} else {
		fail++;
		console.log(`  ❌ ${name}${detail ? '  →  ' + detail : ''}`);
	}
}

function eq(name: string, actual: unknown, expect: unknown) {
	const a = typeof actual === 'string' ? actual : JSON.stringify(actual);
	const e = typeof expect === 'string' ? expect : JSON.stringify(expect);
	ok(name, a === e, a === e ? undefined : `实际 ${a} / 期望 ${e}`);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ========== enc 签名 ==========

console.log('\n  enc 签名');

/** 明文拼接顺序：clazzId / userid / jobid / objectId / 毫秒位置 / 盐 / duration*1000 / clipTime */
eq(
	'明文拼接串',
	buildEncPlain({
		clazzId: '152927685',
		userid: '471303498',
		jobid: '1630205215953644',
		objectId: '0dd2bf49443c19530cb7a010c8777293',
		ms: 120000,
		duration: 341,
		clipTime: '0_341'
	}),
	'[152927685][471303498][1630205215953644][0dd2bf49443c19530cb7a010c8777293][120000][d_yHJ!$pdA~5][341000][0_341]'
);

eq(
	'毫秒位置取 playingTime×1000（不是秒）',
	buildEncPlain({
		clazzId: '1',
		userid: '2',
		jobid: '3',
		objectId: '4',
		ms: 7 * 1000,
		duration: 10,
		clipTime: '0_10'
	}).includes('[7000]'),
	true
);

// ========== 上报 URL ==========

console.log('\n  上报 URL');

const url = buildReportUrl({
	reportUrl: 'https://mooc1.chaoxing.com/mooc-ans/multimedia/log/a/573115653',
	dtoken: 'DT',
	clazzId: '152927685',
	userid: '471303498',
	jobid: '1630205215953644',
	objectId: '0dd2bf49443c19530cb7a010c8777293',
	playingTime: 120,
	duration: 341,
	clipTime: '0_341',
	otherInfo: 'nodeId_1230516287-cpi_573115653',
	isdrag: 0,
	rt: 0.9,
	videoFaceCaptureEnc: 'F',
	attDuration: 341,
	attDurationEnc: 'E',
	ts: 1700000000000
});

const enc = md5(
	'[152927685][471303498][1630205215953644][0dd2bf49443c19530cb7a010c8777293][120000][d_yHJ!$pdA~5][341000][0_341]'
);
eq(
	'字段顺序与取值（逐字符）',
	url,
	'https://mooc1.chaoxing.com/mooc-ans/multimedia/log/a/573115653/DT?clazzId=152927685' +
		'&playingTime=120&duration=341&clipTime=0_341' +
		'&objectId=0dd2bf49443c19530cb7a010c8777293&otherInfo=nodeId_1230516287-cpi_573115653&jobid=1630205215953644&userid=471303498' +
		`&isdrag=0&view=pc&enc=${enc}&rt=0.9` +
		'&videoFaceCaptureEnc=F&dtype=Video&_t=1700000000000&attDuration=341&attDurationEnc=E&courseEngineInfo=false'
);
ok('URL 内 enc 为 32 位十六进制', /enc=[0-9a-f]{32}/.test(url));
ok(
	'音频任务点（无 videoFaceCaptureEnc/attDurationEnc）也能拼出合法 URL',
	!buildReportUrl({
		...{ ...{} },
		reportUrl: 'u',
		dtoken: 'd',
		clazzId: '1',
		userid: '2',
		jobid: '',
		objectId: 'o',
		playingTime: 0,
		duration: 1,
		clipTime: '0_1',
		otherInfo: '',
		isdrag: 3,
		rt: 0.9,
		videoFaceCaptureEnc: '',
		attDuration: 1,
		attDurationEnc: '',
		ts: 1
	}).includes('attDurationEnc=')
);

// ========== 上报点节奏 ==========

console.log('\n  上报点节奏');

eq('首发 play，中间 playing，最后 ended', planPoints(120, 60), [
	{ t: 0, isdrag: 3 },
	{ t: 60, isdrag: 0 },
	{ t: 120, isdrag: 4 }
]);
eq('时长刚好等于步长时只有首发与 ended', planPoints(60, 60).length, 2);
eq('步长非法时回落到 60 秒', planPoints(120, 0).length, 3);

// ========== 完成判定 ==========

console.log('\n  完成判定');

ok('无引号键名的响应体（播放器用 eval 解析的那种）', isPassedBody('{isPassed:true,duration:120}'));
ok('带引号也认', isPassedBody('{"isPassed":true}'));
ok('isPassed:1 视为通过', isPassedBody('{isPassed:1}'));
ok('isPassed:false 不算通过', !isPassedBody('{isPassed:false}'));
ok('isPassed:trueX 不算通过', !isPassedBody('{isPassed:trueX}'));
ok('空响应体不算通过', !isPassedBody(''));

// ========== mArg 解析 ==========

console.log('\n  mArg 解析');

// cards.html 里 mArg 有两处赋值：开头置空 + try 块内真实 JSON，必须取真实那处
const fakeCardHtml =
	'<script>var mArg = {};try{mArg = {"defaults":{"reportUrl":"https://x/log/a/1","clazzId":"1","userid":"2","reportTimeInterval":60,"cardid":9},"attachments":[{"objectId":"obj1","jobid":"j1","attDuration":120}]}}catch(e){}</script>';
const marg = extractMArg(fakeCardHtml);
eq('取到的是 try 块里的真实 mArg（不是开头置空的那处）', marg?.defaults?.cardid, 9);
eq('attachments 解析', marg?.attachments?.length, 1);
eq('垃圾输入返回 null', extractMArg('<html>nothing</html>'), null);

// ========== 并发池 ==========

console.log('\n  并发池');

async function poolTest() {
	let inFlight = 0;
	let maxInFlight = 0;
	let calls = 0;
	const runner = async () => {
		inFlight++;
		maxInFlight = Math.max(maxInFlight, inFlight);
		calls++;
		await sleep(30);
		inFlight--;
	};

	await runConcurrentPool([0, 1, 2, 3, 4, 5, 6], 3, runner);
	eq('7 个作业全部处理', calls, 7);
	ok('并发上限未被突破（≤3）', maxInFlight <= 3, `maxInFlight=${maxInFlight}`);
	ok('确实并发（>1）', maxInFlight > 1, `maxInFlight=${maxInFlight}`);

	maxInFlight = 0;
	await runConcurrentPool([0, 1, 2, 3], 1, runner);
	eq('并发 1 时严格串行', maxInFlight, 1);

	maxInFlight = 0;
	await runConcurrentPool([0, 1], 10, runner);
	eq('作业少于并发数时不空转', maxInFlight, 2);

	let stopFlag = false;
	calls = 0;
	const p = runConcurrentPool(
		[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
		2,
		runner,
		() => stopFlag
	);
	await sleep(40);
	stopFlag = true;
	await p;
	ok('停止后不再派发新作业', calls < 20, `calls=${calls}/20`);
}

poolTest().then(() => {
	console.log(`\n  ✅ ${pass} 通过   ❌ ${fail} 失败   共 ${pass + fail} 项\n`);
	if (fail > 0) process.exit(1);
});
