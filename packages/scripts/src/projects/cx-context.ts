/** global GM_xmlhttpRequest */

import { $store } from 'easy-us';
import { pickBestCandidate, pickBestSentence, scoreCandidate } from '../utils/text-match';
import type { Passage } from '../utils/text-match';
import type { ContextPick } from '../utils/fallback-core';
import { extractMArg, extractPassageFromCardHtml } from '../utils/cx-card';

export interface CxChapter {
	kid: string;
	name: string;
	pending: number;
}

/** GET 请求：跨域时优先 GM_xmlhttpRequest（自动带目标域 cookie），同源用 fetch。finalUrl 为重定向后的最终地址 */
export function gmGet(url: string): Promise<{ status: number; text: string; finalUrl?: string }> {
	// GM_xmlhttpRequest 不支持相对 URL，统一转成绝对地址
	try {
		url = new URL(url, location.href).href;
	} catch (e) {
		/* 已是绝对地址或环境异常，按原样请求 */
	}
	// 同源请求直接 fetch（GM_xmlhttpRequest 受 @connect 白名单限制，同源不需要）
	let sameOrigin = false;
	try {
		sameOrigin = new URL(url).origin === location.origin;
	} catch (e) {
		/* ignore */
	}
	return new Promise((resolve, reject) => {
		try {
			if (typeof GM_xmlhttpRequest !== 'undefined' && !sameOrigin) {
				// eslint-disable-next-line no-undef
				GM_xmlhttpRequest({
					method: 'GET',
					url,
					withCredentials: true,
					timeout: 30000,
					onload: (r: any) => resolve({ status: r.status, text: r.responseText || '', finalUrl: r.finalUrl || url }),
					onerror: () => reject(new Error('GM_xmlhttpRequest error')),
					ontimeout: () => reject(new Error('timeout'))
				} as any);
			} else {
				fetch(url, { credentials: 'include' })
					.then(async (r) => resolve({ status: r.status, text: await r.text(), finalUrl: r.url || url }))
					.catch(reject);
			}
		} catch (e) {
			reject(e);
		}
	});
}

/**
 * POST 请求（课程列表数据接口用）。
 * 同源走 fetch，跨域走 GM_xmlhttpRequest（@connect 白名单内，带 cookie）。
 */
export function gmPost(url: string, body: string): Promise<{ status: number; text: string; finalUrl?: string }> {
	// GM_xmlhttpRequest 不支持相对 URL，统一转成绝对地址
	try {
		url = new URL(url, location.href).href;
	} catch (e) {
		/* 已是绝对地址或环境异常，按原样请求 */
	}
	let sameOrigin = false;
	try {
		sameOrigin = new URL(url).origin === location.origin;
	} catch (e) {
		/* ignore */
	}
	return new Promise((resolve, reject) => {
		try {
			if (typeof GM_xmlhttpRequest !== 'undefined' && !sameOrigin) {
				// eslint-disable-next-line no-undef
				GM_xmlhttpRequest({
					method: 'POST',
					url,
					data: body,
					headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
					withCredentials: true,
					timeout: 30000,
					onload: (r: any) => resolve({ status: r.status, text: r.responseText || '', finalUrl: r.finalUrl || url }),
					onerror: () => reject(new Error('GM_xmlhttpRequest error')),
					ontimeout: () => reject(new Error('timeout'))
				} as any);
			} else {
				fetch(url, {
					method: 'POST',
					credentials: 'include',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
					body
				})
					.then(async (r) => resolve({ status: r.status, text: await r.text(), finalUrl: r.url || url }))
					.catch(reject);
			}
		} catch (e) {
			reject(e);
		}
	});
}

/**
 * 从课程学习页文档读取章节目录。
 * 兼容两种章节树：老版（#coursetree .posCatalog_select + .orangeNew）、
 * 新版门户（.chapter_item[id^=cur] + .catalog_points_yi，名字取 title 属性）。
 */
export function getCourseChapters(doc: Document): CxChapter[] {
	const out: CxChapter[] = [];
	try {
		doc.querySelectorAll<HTMLElement>('#coursetree .posCatalog_select, .posCatalog_select').forEach((el) => {
			const m = (el.id || '').match(/^cur(\d+)$/);
			if (!m) return;
			const nameEl = el.querySelector<HTMLElement>('.posCatalog_name');
			const orange = el.querySelector<HTMLElement>('.orangeNew');
			out.push({
				kid: m[1],
				name: nameEl ? nameEl.getAttribute('title') || nameEl.textContent?.trim() || m[1] : m[1],
				pending: orange ? parseInt(orange.textContent?.trim() || '0', 10) || 0 : 0
			});
		});
		if (out.length === 0) {
			doc.querySelectorAll<HTMLElement>('.chapter_item[id^="cur"]').forEach((el) => {
				const m = (el.id || '').match(/^cur(\d+)$/);
				if (!m) return;
				const points = el.querySelector<HTMLElement>('.catalog_points_yi');
				out.push({
					kid: m[1],
					name: el.getAttribute('title')?.trim() || el.textContent?.trim() || m[1],
					pending: points ? parseInt(points.textContent?.trim() || '0', 10) || 0 : 0
				});
			});
		}
		if (out.length === 0) {
			// 更老的 .cells 变体：章节条目为 h4[id^=cur]（一级为 h3 数字 id）
			doc.querySelectorAll<HTMLElement>('#coursetree h4[id^="cur"], #coursetree h3[id^="cur"]').forEach((el) => {
				const m = (el.id || '').match(/^cur(\d+)$/);
				if (!m) return;
				const titleEl = el.querySelector<HTMLElement>('.titlewords');
				const orange = el.querySelector<HTMLElement>('.orangeNew');
				out.push({
					kid: m[1],
					name: titleEl?.textContent?.trim() || el.getAttribute('title') || el.textContent?.trim() || m[1],
					pending: orange ? parseInt(orange.textContent?.trim() || '0', 10) || 0 : 0
				});
			});
		}
	} catch (e) {
		/* ignore */
	}
	const seen = new Set<string>();
	return out
		.map((c) => ({ ...c, name: c.name.replace(/\s+/g, ' ').trim() }))
		.filter((c) => (seen.has(c.kid) ? false : (seen.add(c.kid), true)));
}

/** 章节骨架里的卡片序号列表 */
export async function fetchChapterCardNums(
	courseId: string,
	clazzid: string,
	chapterId: string,
	cpi: string
): Promise<number[]> {
	const url =
		'/mooc-ans/mycourse/studentstudyAjax?courseId=' +
		courseId +
		'&clazzid=' +
		clazzid +
		'&chapterId=' +
		chapterId +
		'&cpi=' +
		cpi +
		'&verificationcode=&mooc2=1&toComputer=false' +
		'&microTopicId=0&editorPreview=0&isPreviewVideo=false&videoWidth=0&videoHeight=0' +
		'&targetVideoJobId=&cardIndex=0';
	const r = await gmGet(url);
	const doc = new DOMParser().parseFromString(r.text, 'text/html');
	const nums: number[] = [];
	doc.querySelectorAll('#prev_tab .prev_ul li, .prev_ul li').forEach((li, i) => {
		if (li.getAttribute('cardid')) nums.push(i);
	});
	return nums;
}

/** 拉取单张卡片 HTML */
export async function fetchCardHtml(
	courseId: string,
	clazzid: string,
	chapterId: string,
	num: number,
	cpi: string
): Promise<string> {
	const url =
		'/mooc-ans/knowledge/cards?clazzid=' +
		clazzid +
		'&courseid=' +
		courseId +
		'&knowledgeid=' +
		chapterId +
		'&num=' +
		num +
		'&ut=s&cpi=' +
		cpi +
		'&mooc2=1&isMicroCourse=false&editorPreview=0&crossId=';
	const r = await gmGet(url);
	return r.text;
}

/** 查询卡片中某个任务点是否已完成（job 标志消失或 isPassed 为真即完成，与页面显示同源） */
export async function fetchJobPassed(cardPageUrl: string, jobid: string): Promise<boolean | undefined> {
	try {
		const url = cardPageUrl + (cardPageUrl.includes('?') ? '&' : '?') + '_t=' + Date.now();
		const r = await gmGet(url);
		const marg = extractMArg(r.text);
		const att = (marg?.attachments || []).find(
			(a) => String(a.jobid || a.property?._jobid || a.property?.jobid || '') === String(jobid)
		);
		if (!att) return undefined;
		// 完成判定（与页面显示同源）：
		// - isPassed === true：明确的完成信号
		// - job 标志消失：任务点已从「未完成」变为「完成」（job=true 是未完成）
		// 两者都缺失时返回 undefined，让轮询继续（避免把「未刷新」误判为已完成）
		if (att.isPassed === true) return true;
		if (att.job === undefined || att.job === false) {
			// job 消失视为完成，但要求该附件确实是任务点（有 jobid 的才可能是任务点）
			return true;
		}
		return false;
	} catch (e) {
		return undefined;
	}
}

/** 课程入口：stucoursemiddle 会生成 enc 并跳转到课程首页（新版门户） */
export function studyEntryUrlOf(c: { courseid: string; clazzid: string; cpi?: string }): string {
	return (
		'https://mooc1.chaoxing.com/visit/stucoursemiddle?courseid=' +
		c.courseid +
		'&clazzid=' +
		c.clazzid +
		(c.cpi ? '&cpi=' + c.cpi : '') +
		'&ismooc2=1&v=2'
	);
}

/** 章节树页地址：stuenc 即课程首页 URL 中的 enc（实测一致） */
export function studentCourseUrlOf(c: { courseid: string; clazzid: string; cpi?: string }, enc: string): string {
	return (
		'https://mooc2-ans.chaoxing.com/mooc2-ans/mycourse/studentcourse?courseid=' +
		c.courseid +
		'&clazzid=' +
		c.clazzid +
		(c.cpi ? '&cpi=' + c.cpi : '') +
		'&ut=s&t=' +
		Date.now() +
		'&stuenc=' +
		enc
	);
}

/**
 * 在线获取全量章节列表（不依赖当前页面 DOM 的懒加载状态）。
 * 链路：stucoursemiddle → finalUrl 带 enc → studentcourse?stuenc=enc（服务端渲染章节树）。
 */
export async function fetchCourseChaptersOnline(courseId: string, clazzid: string, cpi?: string): Promise<CxChapter[]> {
	try {
		const home = await gmGet(studyEntryUrlOf({ courseid: courseId, clazzid, cpi }));
		const enc = new URL(home.finalUrl || '').searchParams.get('enc');
		if (!enc) return [];
		const tree = await gmGet(studentCourseUrlOf({ courseid: courseId, clazzid, cpi }, enc));
		const doc = new DOMParser().parseFromString(tree.text, 'text/html');
		return getCourseChapters(doc);
	} catch (e) {
		return [];
	}
}

const CACHE_PREFIX = 'cx_course_ctx_';
const CACHE_TTL = 24 * 60 * 60 * 1000;

type LogFn = (...msg: any[]) => void;

/** 课程语料库单例。首次使用时构建（或读缓存），之后常驻内存。 */
export const CourseContext = {
	passages: [] as Passage[],
	ready: false,
	building: false,
	courseKey: '',

	/** 从缓存或网络构建语料库；重复调用直接返回。返回语料片段数。 */
	async ensure(
		courseId: string,
		clazzid: string,
		cpi: string,
		chapters: CxChapter[],
		log: LogFn = () => undefined
	): Promise<number> {
		const key = courseId + '_' + clazzid;
		if (this.ready && this.courseKey === key) return this.passages.length;
		if (this.building) {
			while (this.building) await new Promise((resolve) => setTimeout(resolve, 500));
			return this.courseKey === key ? this.passages.length : 0;
		}
		this.building = true;
		this.passages = [];
		this.ready = false;
		this.courseKey = key;

		try {
			const cacheKey = CACHE_PREFIX + key;
			try {
				const cached = (await $store.get(cacheKey)) as { ts: number; passages: Passage[] } | undefined;
				if (cached && Date.now() - cached.ts < CACHE_TTL && cached.passages?.length) {
					this.passages = cached.passages;
					this.ready = true;
					log('课程语料库命中缓存：' + this.passages.length + ' 个片段');
					return this.passages.length;
				}
			} catch (e) {
				/* 缓存不可用则在线构建 */
			}

			log('开始构建课程语料库：共 ' + chapters.length + ' 章（仅首次，结果缓存 24 小时）');
			const jobs: { chapter: CxChapter; num: number }[] = [];
			for (const ch of chapters) {
				try {
					const nums = await fetchChapterCardNums(courseId, clazzid, ch.kid, cpi);
					for (const num of nums) jobs.push({ chapter: ch, num });
					await new Promise((resolve) => setTimeout(resolve, 250 + Math.random() * 250));
				} catch (e) {
					/* 单章失败跳过 */
				}
			}

			let done = 0;
			const worker = async () => {
				while (jobs.length) {
					const job = jobs.shift();
					if (!job) return;
					try {
						const html = await fetchCardHtml(courseId, clazzid, job.chapter.kid, job.num, cpi);
						const passage = extractPassageFromCardHtml(html, job.chapter.name + '#卡' + job.num);
						if (passage) this.passages.push(passage);
					} catch (e) {
						/* 单卡失败跳过 */
					}
					done++;
					if (done % 10 === 0) log('语料库构建中：' + done + ' 张卡片已处理，' + this.passages.length + ' 个片段');
					await new Promise((resolve) => setTimeout(resolve, 250 + Math.random() * 250));
				}
			};
			await worker();

			this.ready = true;
			log('课程语料库构建完成：' + this.passages.length + ' 个片段');
			try {
				await $store.set(cacheKey, { ts: Date.now(), passages: this.passages });
			} catch (e) {
				/* 持久化失败不影响使用 */
			}
			return this.passages.length;
		} finally {
			this.building = false;
		}
	},

	/** 选择题：从语料中选出支持度最高的选项 */
	pickOption(question: string, optionTexts: string[]): ContextPick | undefined {
		if (!this.ready || !this.passages.length) return undefined;
		const pick = pickBestCandidate(question, optionTexts, this.passages);
		if (!pick) return undefined;
		// pick.index 是候选索引而非语料索引，重新定位得分最高的语料片段作为来源
		let source: string | undefined;
		let bestScore = -1;
		for (const p of this.passages) {
			const s = scoreCandidate(question, pick.candidate, [p]);
			if (s > bestScore) {
				bestScore = s;
				source = p.source;
			}
		}
		return { answer: pick.candidate, score: pick.score, source };
	},

	/** 填空题：从语料中选出与题目最相似的文句 */
	pickSentence(question: string): ContextPick | undefined {
		if (!this.ready || !this.passages.length) return undefined;
		const best = pickBestSentence(question, this.passages);
		if (!best) return undefined;
		return { answer: best.sentence, score: best.score, source: best.source };
	}
};
