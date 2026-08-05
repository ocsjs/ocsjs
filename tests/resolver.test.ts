/**
 * 答题器匹配算法测试
 *
 * pnpm test                   运行全部
 * pnpm test -- --filter 单选  按关键词筛选
 * pnpm test -- --filter 多选
 * pnpm test -- --filter 消歧
 * pnpm test -- --filter 判断
 * pnpm test -- --filter 填空
 *
 * 用例维护：编辑 tests/cases.json 即可，无需改本文件
 */

import { resolveSingle } from '../packages/core/src/core/worker/resolvers/single';
import { resolveMultiple, disambiguateSimilarOptions } from '../packages/core/src/core/worker/resolvers/multiple';
import { resolveJudgement } from '../packages/core/src/core/worker/resolvers/judgement';
import { resolveCompletion } from '../packages/core/src/core/worker/resolvers/completion';
import { answerSimilar, removeRedundant } from '../packages/core/src/core/utils/string';
import { splitAnswer } from '../packages/core/src/core/worker/utils';
import _cases from './cases.json';
const cases = _cases as Cases;

// ========== JSON 类型声明 ==========

/** 选项类题型用例（单选/多选/多选ABCD/消歧/判断） */
interface OptionCase {
	a: string;
	opts: string[];
	expect: number[];
}

/** 填空题用例（答案为自由文本，按空位顺序的字符串数组） */
interface CompletionCase {
	a: string;
	blanks: number;
	expect: string[];
}

interface Cases {
	single: OptionCase[];
	multiple: OptionCase[];
	disambiguation: OptionCase[];
	judgement: OptionCase[];
	completion: CompletionCase[];
}

// ========== 工具 ==========

let pass = 0;
let fail = 0;
const filter = process.argv.includes('--filter')
	? process.argv[process.argv.indexOf('--filter') + 1]?.toLowerCase()
	: undefined;

function section(title: string) {
	if (filter && !title.toLowerCase().includes(filter)) return false;
	console.log(`\n  ${title}`);
	return true;
}

/** 字符串数组断言：保序深比较（填空答案按空位顺序，顺序敏感） */
function okStrArr(actual: string[], expected: string[], info: string) {
	const same = actual.length === expected.length && actual.every((v, i) => v === expected[i]);
	if (same) {
		pass++;
	} else {
		fail++;
		console.log(`    ❌ ${info}  期望=${JSON.stringify(expected)}  结果=${JSON.stringify(actual)}`);
	}
}

/** 使用 answerSimilar 自动计算相似度评分，并过滤掉 ≤0.6 的选项（与 resolver pipeline 一致） */
function computeRatings(answer: string, options: string[]): { opts: string[]; ratings: number[] } {
	// 与 resolver pipeline 一致：使用 splitAnswer 拆分多答案（#、;、| 等分隔符），而非仅按 ;
	const answers = splitAnswer(answer).map((a) => removeRedundant(a));
	const _options = options.map(removeRedundant);
	const raw = answerSimilar(answers, _options);
	const opts: string[] = [];
	const ratings: number[] = [];
	for (let i = 0; i < raw.length; i++) {
		if (raw[i].rating > 0.6) {
			opts.push(options[i]);
			ratings.push(raw[i].rating);
		}
	}
	return { opts, ratings };
}

function fmtOptCtx(c: { a: string; opts: string[] }) {
	return `答案=${JSON.stringify(c.a)}  选项=${JSON.stringify(c.opts)}`;
}

function fmtBlankCtx(c: { a: string; blanks: number }) {
	return `答案=${JSON.stringify(c.a)}  填空数=${c.blanks}`;
}

// ========== 索引工具 ==========
//
// expect 字段格式：
//   单选/判断   expect: [2]          → 第 2 个选项（1-based，集合比较）
//   多选/消歧   expect: [1,3]        → 第 1、3 个选项（集合比较，顺序无关）
//   填空        expect: ["答案A","答案B"]  → 按空位顺序的答案（保序比较）
//   无匹配      expect: []           → 无命中

/** 多个解析选项 → 升序去重的 1-based 索引数组 */
function idxList(opts: string[], resolved: string[] | undefined): number[] {
	const indices = (resolved ?? []).map((o) => opts.indexOf(o) + 1).filter((i) => i > 0);
	return [...new Set(indices)].sort((a, b) => a - b);
}

/** 单个解析选项 → 1-based 索引数组，未匹配/无结果返回 [] */
function idxOf(opts: string[], opt: string | undefined): number[] {
	const i = opt === undefined ? -1 : opts.indexOf(opt);
	return i > -1 ? [i + 1] : [];
}

/** 数组断言：顺序无关，按集合比较 */
function okArr(actual: number[], expected: number[], info: string) {
	const same = actual.length === expected.length && actual.every((v) => expected.includes(v));
	if (same) {
		pass++;
	} else {
		fail++;
		console.log(`    ❌ ${info}  期望=${JSON.stringify(expected)}  结果=${JSON.stringify(actual)}`);
	}
}

// ========== 单选题 ==========

if (section('单选题')) {
	for (const c of cases.single) {
		const r = resolveSingle(c.a.split(';'), c.opts);
		const actual = r.finish ? idxOf(c.opts, r.option) : [];
		okArr(actual, c.expect, fmtOptCtx(c));
	}
}

// ========== 多选题 ==========

if (section('多选题')) {
	for (const c of cases.multiple) {
		const r = resolveMultiple([c.a], c.opts);
		// 纯 ABCD 答案走 plainOptions 兜底，普通匹配走 options
		const actual = r.finish ? idxList(c.opts, r.options ?? r.plainOptions) : [];
		okArr(actual, c.expect, fmtOptCtx(c));
	}
}

// ========== 消歧 ==========

if (section('消歧')) {
	for (const c of cases.disambiguation) {
		const { opts: filteredOpts, ratings } = computeRatings(c.a, c.opts);
		const r = disambiguateSimilarOptions(filteredOpts, ratings);
		okArr(idxList(c.opts, r), c.expect, fmtOptCtx(c));
	}
}

// ========== 判断题 ==========

if (section('判断题')) {
	for (const c of cases.judgement) {
		const r = resolveJudgement([[c.a]], c.opts);
		const actual = r.finish ? idxOf(c.opts, r.option) : [];
		okArr(actual, c.expect, fmtOptCtx(c));
	}
}

// ========== 填空题 ==========
//
// 填空答案为自由文本，expect 为按空位顺序的字符串数组（顺序敏感）

if (section('填空题')) {
	for (const c of cases.completion) {
		const r = resolveCompletion(
			c.a.split(' / ').map((s) => [s.trim()]),
			c.blanks
		);
		const actual = r.finish ? r.answers ?? [] : [];
		okStrArr(actual, c.expect, fmtBlankCtx(c));
	}
}

// ========== 结果 ==========

console.log(`\n  ✅ ${pass} 通过   ❌ ${fail} 失败   共 ${pass + fail} 项\n`);

if (fail > 0) process.exit(1);
