/**
 * 超星卡片页解析（纯逻辑，无 DOM/浏览器依赖，可在 node 中直接测试）
 */

import { stripHtml } from './text-match';

export interface CxAttachment {
	objectId?: string;
	jobid?: string;
	isPassed?: boolean;
	job?: boolean;
	property?: {
		_jobid?: string;
		jobid?: string;
		module?: string;
		name?: string;
		title?: string;
		bookname?: string;
	};
	[k: string]: any;
}

export interface CxMArg {
	defaults?: Record<string, any>;
	attachments?: CxAttachment[];
}

/**
 * 从卡片 HTML 中提取 mArg 对象。
 * cards.html 中 mArg 有两处赋值（开头置空 + try 块内真实 JSON），取真实那处。
 */
export function extractMArg(html: string): CxMArg | null {
	const re = /mArg\s*=\s*(\{[\s\S]*?\})\s*;\s*\}catch\(/g;
	let m: RegExpExecArray | null;
	let last: string | null = null;
	while ((m = re.exec(html))) last = m[1];
	if (last) {
		try {
			return JSON.parse(last);
		} catch (e) {
			/* 落回下面的截取 */
		}
	}
	const c = html.search(/\}catch\s*\(/);
	if (c > 0) {
		const head = html.slice(0, c);
		const i = head.lastIndexOf('mArg');
		if (i >= 0) {
			const eq = head.indexOf('=', i);
			let s = head.slice(eq + 1).trim();
			if (s.endsWith(';')) s = s.slice(0, -1).trim();
			if (s.startsWith('{')) {
				try {
					return JSON.parse(s);
				} catch (e) {
					/* ignore */
				}
			}
		}
	}
	return null;
}

/** 从卡片 HTML 提取语料文本（附件名称 + 正文） */
export function extractPassageFromCardHtml(html: string, source: string): { source: string; text: string } | undefined {
	const marg = extractMArg(html);
	const names = (marg?.attachments || [])
		.map((a) => a.property?.name || a.property?.title || a.property?.bookname || '')
		.filter(Boolean)
		.join(' ');
	const text = stripHtml(html).replace(/\s+/g, ' ').slice(0, 4000);
	const full = (names + ' ' + text).trim();
	if (full.length < 8) return undefined;
	return { source, text: full };
}

/**
 * 从卡片 mArg 中计算未完成的任务点（纯逻辑，可单测）。
 * 判定与页面显示同源：isPassed === true 视为完成；job 标志消失（undefined/false）视为完成；
 * 只有 job === true 且未通过的是未完成任务点。
 */
export function computeUnfinishedJobs(mArg: CxMArg | null): CxAttachment[] {
	if (!mArg || !Array.isArray(mArg.attachments)) return [];
	return mArg.attachments.filter((a) => {
		const jobid = a.jobid || a.property?._jobid || a.property?.jobid;
		if (!jobid) return false;
		if (a.isPassed === true) return false;
		if (a.job === undefined || a.job === false) return false;
		return true;
	});
}

/** 未完成任务点的摘要（用于日志与补刷调度） */
export interface UnfinishedJob {
	jobid: string;
	name: string;
	module?: string;
}

/** 附件转摘要 */
export function toUnfinishedJob(a: CxAttachment): UnfinishedJob {
	return {
		jobid: String(a.jobid || a.property?._jobid || a.property?.jobid || ''),
		name: a.property?.name || a.property?.title || a.property?.bookname || '未知任务',
		module: a.property?.module
	};
}
