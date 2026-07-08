/**
 * 答题器 (createCommonAnswerer) 管线测试脚本
 *
 * 通过 answerer.config.json 配置题库、题目和选项进行答题调试。
 * 直接测试 defaultAnswerWrapperHandler 管线（createCommonAnswerer 的核心下游），
 * 因为 createCommonAnswerer 依赖浏览器环境 (CommonProject / DOM)，无法在 Node 中导入。
 *
 * env 对象由 buildAnswererEnv 构建（与生产管线一致），并打印输出，
 * 便于核对最新更新的图片题优化功能：
 *   - 原 title / options 始终保留不动，不再被覆盖
 *   - 标题 / 选项中包含图片 URL 时，会下载图片转 base64，并以独立字段写入 env：
 *       images            : string[]   base64 图片数组（顺序对应 [图片1]、[图片2]…）
 *       suggestion_title  : string     原题标题 URL 替换为 [图片N] 占位符后的文本
 *       suggestion_options: string     原选项替换后的文本（仅选项含图片时存在）
 *   - 旧版题库配置（只读 ${title} / ${options}）不会上传这些新字段，需 v2 配置显式引用
 *
 * 用法：
 *   pnpm test:answerer                                  使用默认 answerer.config.json 配置
 *   pnpm test:answerer -- --config ./path/to/config.json   指定配置文件路径
 *
 * 所有测试参数（title / options / type / wrappers / verbose / aiImageSuggestion）均来自配置文件，
 * CLI 仅支持 --config 指定配置文件路径。
 *
 * 浏览器环境模拟由 tests/setup-browser-env.ts 通过 `tsx --import` 预加载，
 * 不能在本文件内 require('browser-env')：ES import 会被提升到 require 之前执行，
 * 导致 easy-us 顶层 `class IElement extends HTMLElement` 先于 HTMLElement 注册而崩溃。
 */

import fs from 'fs';
import { AnswerWrapperParser } from '../packages/core/src/core/answer-wrapper/answer.wrapper.parser';
import { defaultAnswerWrapperHandler } from '../packages/core/src/core/answer-wrapper/answer.wrapper.handler';
import type { AnswererWrapper, SearchInformation } from '../packages/core/src/core/answer-wrapper/interface';
import { $ } from '../packages/core/src/utils/common';
// buildAnswererEnv 已抽取到无 CommonProject 依赖的独立模块，可在 Node 下直接导入，
// 用于测试 AI 图片建议 (createImageSuggestion) 与图片题优化功能。
import { buildAnswererEnv } from '../packages/scripts/src/utils/answerer-env';

// ========== CLI 参数解析 ==========

/** CLI 仅支持 --config 指定配置文件路径 */
function getArg(flag: string): string | undefined {
	const idx = process.argv.indexOf(flag);
	return idx !== -1 ? process.argv[idx + 1] : undefined;
}

/**
 * 将 base64 图片写入 tests/image/ 目录，便于在 IDE 中直接查看。
 * 入参为 data URL：data:<mime>;base64,<b64>
 * 返回写入的文件相对路径。
 */
function writeImageToFile(dataUrl: string, index: number): string | undefined {
	const m = dataUrl.match(/^data:([^;,]+).*?;base64,(.+)$/s);
	if (!m) {
		console.log(`   [图片${index}] (无法解析 base64)`);
		return;
	}
	const [, mimeType, b64] = m;
	// mime → 扩展名
	const ext = mimeType === 'image/jpeg' ? 'jpg' : mimeType.replace(/^image\//, '');
	const dir = 'tests/image';
	fs.mkdirSync(dir, { recursive: true });
	const filePath = `${dir}/图片${index}.${ext}`;
	fs.writeFileSync(filePath, b64, 'base64');
	return filePath;
}

// ========== 配置加载 ==========

const CONFIG_PATH = getArg('--config') || 'answerer.config.json';

/** 读取 JSON 配置文件，文件不存在时返回空对象 */
function loadConfig(path: string): Record<string, any> {
	if (!fs.existsSync(path)) return {};
	try {
		return JSON.parse(fs.readFileSync(path, 'utf8'));
	} catch (err: any) {
		console.error(`\n❌ 配置文件解析失败 (${path}): ${err.message}`);
		process.exit(1);
	}
}

const config = loadConfig(CONFIG_PATH);

/**
 * 强制 request() 走 Node 分支（node-fetch）。
 *
 * browser-env 为了让 easy-us 的 `class IElement extends HTMLElement` 能加载，
 * 注册了 window/document，这会让 $.isInBrowser() 返回 true，于是 request()
 * 对 type:'GM_xmlhttpRequest' 的题库走 GM 分支并因无 GM API 而失败。
 * 本测试在 Node 下运行、没有真实 GM_xmlhttpRequest，故强制视作 Node 环境，
 * 让所有题库（含 GM 类型）统一降级为 node-fetch 发请求。
 */
($ as any).isInBrowser = () => false;

// ========== 主逻辑 ==========

async function main() {
	// 所有参数均来自配置文件
	const title = config.title || '';
	const options = config.options ?? '';
	const type = config.type || 'unknown';
	// wrappers 支持数组（直接配置）或字符串（JSON 字符串/URL/base64）
	const rawWrappers = config.wrappers;
	const verbose = !!config.verbose;
	// 是否启用 AI 图片建议（默认 true，便于测试图片题优化功能）
	const imageOptimize = config.imageOptimize ?? true;

	if (!rawWrappers || (Array.isArray(rawWrappers) && rawWrappers.length === 0)) {
		console.error('❌ 未提供题库配置。请在 answerer.config.json 中设置 wrappers。');
		console.error('   参考 tests/answerer.config.example.json 了解配置格式。');
		process.exit(1);
	}

	if (!title) {
		console.error('❌ 未提供题目标题。请在 answerer.config.json 中设置 title。');
		process.exit(1);
	}

	// 解析题库配置
	console.log('\n🔍 答题器管线测试');
	console.log(`   题目: ${title}`);
	console.log(`   选项: ${options || '(无)'}`);
	console.log(`   类型: ${type}`);

	let wrappers: AnswererWrapper[];
	try {
		const parsed = AnswerWrapperParser.from(rawWrappers);
		wrappers = await (parsed instanceof Promise ? parsed : parsed);
	} catch (err: any) {
		console.error(`\n❌ 题库配置解析失败: ${err.message}`);
		process.exit(1);
	}

	console.log(`   题库数量: ${wrappers.length}`);

	// 检测 GM_xmlhttpRequest 类型并警告
	const gmWrappers = wrappers.filter((w) => w.type === 'GM_xmlhttpRequest');
	if (gmWrappers.length > 0) {
		console.warn(`\n⚠️  ${gmWrappers.length} 个题库使用 GM_xmlhttpRequest 类型：`);
		for (const w of gmWrappers) {
			console.warn(`   - "${w.name}" (${w.url})`);
		}
		console.warn('   Node 环境下 GM_xmlhttpRequest 不可用，将自动降级为 node-fetch。');
		console.warn('   跨域绕过行为与浏览器环境不同，部分请求可能失败。\n');
	}

	// 使用 buildAnswererEnv 构建 env（与生产管线一致）
	// 原 title / options 保留不动；图片 URL 会下载转 base64，写入新增字段
	// images / suggestion_title / suggestion_options
	const env = await buildAnswererEnv({ type, title, options, enableImageOptimize: imageOptimize });

	// 输出 env 便于核对图片题优化的新增字段
	const envPreview: Record<string, any> = { ...env };
	// base64 内容可能很长，打印时截断（images 数组逐项截断，长字符串字段截断）
	if (Array.isArray(envPreview.images)) {
		envPreview.images = envPreview.images.map((b64: string, i: number) =>
			b64.length > 120 ? b64.slice(0, 120) + `...（共 ${env.images[i].length} 字符）` : b64
		);
	}
	for (const key of ['suggestion_title', 'suggestion_options']) {
		if (typeof envPreview[key] === 'string' && envPreview[key].length > 200) {
			envPreview[key] = envPreview[key].slice(0, 200) + `...（共 ${env[key].length} 字符）`;
		}
	}
	console.log('\n📦 搜题环境变量:');
	console.log(JSON.stringify(envPreview, null, 2).replace(/^/gm, '   '));

	// 将 base64 图片写入 tests/image/ 目录，便于在 IDE 中直接查看
	if (Array.isArray(env.images) && env.images.length) {
		console.log('\n🖼️  图片已写入 tests/image/:');
		env.images.forEach((b64: string, i: number) => {
			const path = writeImageToFile(b64, i + 1);
			if (path) console.log(`   [图片${i + 1}] -> ${path}`);
		});
	}

	// 执行搜题
	console.log('\n⏳ 正在搜题...');

	let searchInfos: SearchInformation[];
	try {
		searchInfos = await defaultAnswerWrapperHandler(wrappers, env);
	} catch (err: any) {
		console.error(`\n❌ 搜题失败: ${err.message}`);
		process.exit(1);
	}

	// 打印结果
	let totalResults = 0;
	let errorCount = 0;
	let successCount = 0;

	for (const info of searchInfos) {
		console.log(`\n─── ${info.name} ───`);
		console.log(`  URL: ${info.url}`);

		if (info.error) {
			errorCount++;
			console.log(`  ❌ 错误: ${info.error}`);
			continue;
		}

		successCount++;
		const resultCount = info.results.length;
		totalResults += resultCount;

		if (resultCount === 0) {
			console.log('  ⚠️  未搜到答案');
		} else {
			console.log(`  ✅ 搜到 ${resultCount} 个结果`);
			for (const result of info.results) {
				console.log(`    题目: ${result.question}`);
				console.log(`    答案: ${result.answer}`);
				if (result.extra_data && Object.keys(result.extra_data).length) {
					console.log(`    附加: ${JSON.stringify(result.extra_data)}`);
				}
			}
		}

		if (verbose) {
			const responseStr = JSON.stringify(info.response);
			console.log(`  响应数据: ${responseStr.length > 500 ? responseStr.substring(0, 500) + '...' : responseStr}`);
			console.log(`  请求数据: ${JSON.stringify(info.data)}`);
		}
	}

	// 汇总
	console.log('\n=== 汇总 ===');
	console.log(`  题库总数:   ${searchInfos.length}`);
	console.log(`  成功题库:   ${successCount}`);
	console.log(`  失败题库:   ${errorCount}`);
	console.log(`  搜题结果数: ${totalResults}`);
	console.log(totalResults > 0 ? '\n✅ 测试通过' : '\n❌ 未搜到任何答案');

	process.exit(totalResults > 0 ? 0 : 1);
}

main();
