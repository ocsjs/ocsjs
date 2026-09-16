/**
 * 重复注入时「只创建一个悬浮窗」测试
 *
 * 背景：easy-us 内部的 mounted 是模块级变量，重复注入脚本会产生多份互不可见的模块实例，
 * 页面上因此会出现多个完全相同的 OCS 悬浮窗（见 issue #162）。
 *
 * 本测试通过 jsdom 模拟真实文档，反复调用被防护包装过的 start，
 * 验证只有第一个实例会真正创建悬浮窗，其余实例被跳过。
 *
 * 运行：tsx tests/start-guard.test.ts
 */

import browserEnv from 'browser-env';
import {
	acquireWindowMount,
	createGuardedStart,
	isWindowMounted,
	OCS_WINDOW_MOUNTED_ATTRIBUTE,
	releaseWindowMount
} from '../packages/scripts/src/utils/start-guard';

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

/** 与 easy-us 的 StartConfig 结构保持一致的最小配置 */
function createConfig() {
	return {
		projects: [],
		renderConfig: {
			renderScript: { cfg: {} },
			title: 'test',
			styles: [],
			defaultPanelName: 'panel'
		}
	} as any;
}

/** 默认认为当前页面需要创建悬浮窗 */
const mountYes = () => true;
/** 模拟「当前页面没有匹配脚本」 */
const mountNo = () => false;

async function main() {
	// 该测试在 node 环境中运行，需要先模拟浏览器全局对象再加载模块
	browserEnv();

	console.log('\n  挂载名额的获取与释放');
	{
		const root = document.documentElement;
		releaseWindowMount(root);

		check('首次获取名额成功', acquireWindowMount(root) === true);
		check('标记已写入 documentElement', isWindowMounted(root));
		check('再次获取名额失败', acquireWindowMount(root) === false);

		releaseWindowMount(root);
		check('释放后可再次获取', acquireWindowMount(root) === true);
		releaseWindowMount(root);
	}

	console.log('\n  重复注入：只有第一个实例创建悬浮窗');
	{
		const root = document.documentElement;
		releaseWindowMount(root);

		const warnings: string[] = [];
		const originalWarn = console.warn;
		console.warn = (...args: any[]) => warnings.push(args.join(' '));

		let startCount = 0;
		const start = createGuardedStart(async () => {
			startCount++;
		}, mountYes);

		await start(createConfig());
		await start(createConfig());
		await start(createConfig());

		console.warn = originalWarn;

		check('start 只真正执行了一次', startCount === 1, `实际 ${startCount} 次`);
		check('后续实例输出跳过警告', warnings.length === 2, `实际 ${warnings.length} 条`);
		check(
			'警告内容可识别',
			warnings.every((w) => w.includes('already created a window')),
			warnings.join(' | ')
		);
		releaseWindowMount(root);
	}

	console.log('\n  不同文档之间互不影响');
	{
		const root = document.documentElement;
		releaseWindowMount(root);

		// 用独立元素模拟另一个文档（iframe）的 documentElement
		const otherDocumentRoot = document.createElement('html');

		check('第二个文档可以独立获取名额', acquireWindowMount(otherDocumentRoot) === true);
		check('第二个文档的标记独立存在', isWindowMounted(otherDocumentRoot));
		check('当前文档仍可获取名额', acquireWindowMount(root) === true);

		releaseWindowMount(root);
		releaseWindowMount(otherDocumentRoot);
	}

	console.log('\n  不需要创建悬浮窗的场景不受影响');
	{
		const root = document.documentElement;
		releaseWindowMount(root);

		let count = 0;
		const start = createGuardedStart(async () => {
			count++;
		}, mountNo);

		// 当前页面没有匹配脚本时，easy-us 不会创建悬浮窗
		await start(createConfig());
		await start(createConfig());

		check('无匹配脚本时每次都会执行', count === 2, `实际 ${count} 次`);
		check('无匹配脚本时不占用名额', !isWindowMounted(root));

		let noRenderConfigCount = 0;
		const start2 = createGuardedStart(async () => {
			noRenderConfigCount++;
		}, mountYes);
		await start2({ projects: [] } as any);
		await start2({ projects: [] } as any);

		check('无 renderConfig 时每次都会执行', noRenderConfigCount === 2, `实际 ${noRenderConfigCount} 次`);
		check('无 renderConfig 时不占用名额', !isWindowMounted(root));
	}

	console.log('\n  启动抛错时释放名额');
	{
		const root = document.documentElement;
		releaseWindowMount(root);

		const start = createGuardedStart(async () => {
			throw new Error('boom');
		}, mountYes);

		let caught = false;
		try {
			await start(createConfig());
		} catch (error) {
			caught = (error as Error).message === 'boom';
		}

		check('错误继续向上抛出', caught);
		check('抛错后名额被释放', !isWindowMounted(root));
	}

	console.log('\n  document-start：documentElement 尚未出现时等待后再去重');
	{
		// 模拟 document-start：临时移除 documentElement，稍后再放回
		const html = document.documentElement;
		const root = document.createElement('html');
		document.removeChild(html);

		let startCount = 0;
		const start = createGuardedStart(
			async () => {
				startCount++;
			},
			mountYes,
			{ waitTimeout: 1000 }
		);

		const first = start(createConfig());
		const second = start(createConfig());

		// 等两个实例都进入等待状态后，再补上 documentElement
		await new Promise((resolve) => setTimeout(resolve, 50));
		document.appendChild(root);

		await Promise.all([first, second]);

		check('document-start 下仍然只执行一次', startCount === 1, `实际 ${startCount} 次`);
		check('等待后名额被占用', isWindowMounted(root));
	}

	console.log(`\n  ✅ ${pass} 通过    ${fail} 失败   共 ${pass + fail} 项\n`);
	process.exitCode = fail === 0 ? 0 : 1;
}

main();
