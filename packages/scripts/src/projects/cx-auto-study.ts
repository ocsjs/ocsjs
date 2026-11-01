/**
 * 超星自动刷课调度
 *
 * 在学习通课程列表页（个人空间）扫描所有课程的未完成任务点，
 * 浮动面板展示清单，用户点击「开始刷课」（按钮变为「结束」）后，
 * 依次跳转每门课的学习页，配合课程学习脚本自动完成；
 * 一门课全部任务点完成后自动进入下一门，全部完成回到列表页。
 */

import { $store, h, $ui, $message } from 'easy-us';
import { $console } from './background';
import { gmGet, gmPost, studyEntryUrlOf, studentCourseUrlOf } from './cx-context';

export interface AutoStudyCourse {
	courseid: string;
	clazzid: string;
	cpi: string;
	name: string;
	/** 未完成任务点数；-1 检测失败（请求异常/未拿到 enc），-3 未检测（扫描被反爬中止），0 已完成，>0 剩余数 */
	pending: number;
	/** 开课时间中的结束日期 YYYY-MM-DD，页面未展示时为空 */
	endDate?: string;
	/** 已结课（结束时间早于当前时间或课程名含往年），结课后不再扫描 */
	ended?: boolean;
	/** 页面官方「课程已结束」标记（比日期推断更可靠） */
	endedOfficial?: boolean;
	/** 列表页「任务点进度 X/Y」：已完成数/总数，页面未展示时为空 */
	progressDone?: number;
	progressTotal?: number;
	/** 全新课：上一次扫描记录中不存在（新出现的课程） */
	isNew?: boolean;
	/** 用户手动忽略，忽略后不扫描不刷课 */
	ignored?: boolean;
	/** 用户手动把「已完成」课程设为可选（默认已完成不可选） */
	forceSelectable?: boolean;
}

interface AutoStudyState {
	running: boolean;
	index: number;
	queue: AutoStudyCourse[];
	ts: number;
}

const STORE_KEY = 'cx_auto_study_queue';
/** 扫描结果持久缓存：扫描过一次就记录，下次直接使用，只有用户再次手动扫描才更新 */
const SCAN_CACHE_KEY = 'cx_auto_study_scan';
const COURSE_LIST_URL =
	'https://mooc2-ans.chaoxing.com/mooc2-ans/visit/interaction?moocDomain=https://mooc1-2.chaoxing.com/mooc-ans';
/**
 * 新版门户课程列表数据接口。
 * 实测：课程列表页本身的 HTML 不含课程（由页面 JS 调该 POST 渲染），
 * 直接打这个接口一次即可拿回全部课程卡片 HTML（含进度/结课标记），无需导航。
 */
const COURSE_LIST_DATA_URL = 'https://mooc2-ans.chaoxing.com/mooc2-ans/visit/courselistdata';
/** 与页面自身请求完全一致的表体位（无 token，cookie 认证） */
const COURSE_LIST_DATA_BODY =
	'courseType=1&courseFolderId=0&query=&pageHeader=-1&single=0&superstarClass=0&isFirefly=0&fid=&from=';
/** 用户手动忽略的课程（courseid_clazzid 数组），忽略后不扫描不刷课 */
const IGNORED_KEY = 'cx_auto_study_ignored';
/** 用户手动设为可选的「已完成」课程（courseid_clazzid 数组），跨会话持久 */
const FORCE_SELECTABLE_KEY = 'cx_auto_study_force_selectable';
/**
 * 永久结课标记：[{ key, name, reason, ts }]
 * 一经标记永不重复检测（零请求）；课程从列表页消失后仍合并展示。
 * 数据存于 GM 存储（扩展磁盘数据库），浏览器重启 / 退出重登均保留。
 */
const ENDED_KEY = 'cx_auto_study_ended';
/** 永久完成标记：[{ key, name, ts }]，仅当课程不在列表页时兜底展示（防后加任务被掩盖） */
const DONE_KEY = 'cx_auto_study_done';
/** 扫描后自动导出记录文件开关（独立存储键，避免与 cx.ts 循环依赖 Script cfg） */
const AUTO_EXPORT_KEY = 'cx_auto_study_autoexport';

export interface EndedMarker {
	key: string;
	name: string;
	reason: string;
	ts: number;
}

export interface DoneMarker {
	key: string;
	name: string;
	ts: number;
}

export interface ScanRecordExport {
	version: string;
	exportedAt: number;
	scan?: { ts: number; courses: AutoStudyCourse[] };
	ignored?: string[];
	forceSelectable?: string[];
	ended?: EndedMarker[];
	done?: DoneMarker[];
}

/** enc 会话缓存：实测同一会话内同一课程的 enc 稳定，缓存后重扫可省掉第一跳请求 */
const encCache = new Map<string, { enc: string; ts: number }>();
const ENC_TTL = 30 * 60 * 1000;

/** 收集容器内去重的课程键（courseid_clazzid），用于识别「单个课程卡片」边界 */
function courseKeysOf(root: Element): Set<string> {
	const keys = new Set<string>();
	root
		.querySelectorAll<HTMLAnchorElement>(
			'a[href*="stucoursemiddle"], a[href*="mycourse/stu"], a[href*="courseid="], a[href*="courseId="]'
		)
		.forEach((a) => {
			const href = a.href || '';
			const cid = href.match(/courseid=(\d+)/i)?.[1];
			const clz = href.match(/clazzid=(\d+)/i)?.[1];
			if (cid && clz) keys.add(cid + '_' + clz);
		});
	return keys;
}

/**
 * 定位单个课程卡片容器：优先已知卡片类名；
 * 否则沿父链向上找「只含一门课」的最近祖先——避免把整列表容器当卡片
 * （否则一门课的「课程已结束/任务点进度」会污染同容器内所有课程）。
 */
function resolveCourseContainer(el: Element): Element | null {
	const known = el.closest(
		'.course, .courseItem, .course-item, .course-card, .courseCard, [class*="course-info"], [class*="courseInfo"]'
	);
	if (known) return known;
	let p = el.parentElement;
	while (p && p !== document.body) {
		if (courseKeysOf(p).size === 1) return p;
		p = p.parentElement;
	}
	return el.parentElement;
}

/** 反爬验证码页检测 */
function isAntispider(r: { finalUrl?: string; text: string }): boolean {
	return (
		(r.finalUrl || '').includes('antispider') ||
		r.text.includes('antispiderShowVerify') ||
		r.text.includes('操作异常，请输入图片中的验证码')
	);
}

/** 最近一次触发反爬的请求地址，供验证弹窗内嵌/打开验证页 */
let lastAntispiderUrl = '';

/** 反爬检测并记录触发地址（用于弹出验证页） */
function isAntispiderHit(r: { finalUrl?: string; text: string }, url: string): boolean {
	if (!isAntispider(r)) return false;
	lastAntispiderUrl = r.finalUrl || url;
	return true;
}

/** 解析章节树 HTML 的未完成任务点总数；返回 null 表示响应不可用（需回退完整链路） */
function parseTreePending(text: string): number | null {
	if (!text.includes('chapter_item') && !text.includes('catalog_points_yi') && !text.includes('orangeNew')) {
		return null;
	}
	let sum = 0;
	let m: RegExpExecArray | null;
	const reNew = /catalog_points_yi[^>]*>\s*(\d+)\s*</g;
	while ((m = reNew.exec(text))) sum += parseInt(m[1], 10) || 0;
	if (sum === 0) {
		const reOld = /class=["'][^"']*orangeNew[^"']*["'][^>]*>\s*(\d+)\s*</g;
		while ((m = reOld.exec(text))) sum += parseInt(m[1], 10) || 0;
	}
	return sum;
}

/** 当前是否课程列表页（只有该页的课程卡片带 courseid 链接） */
function isCourseListPage(): boolean {
	return location.href.includes('/visit/interaction') || location.href.includes('kb.chaoxing.com/res/pc/curriculum');
}
/**
 * 新版门户真正的课程列表页地址（服务端渲染全部课程+进度，cookie 认证、无需 token）。
 * 实测：mooc1-2.chaoxing.com/visit/interaction?s=xxx 只是 JS 跳转壳（GM 拉不到课程），
 * 真实列表由页面 JS 加载到 mooc2-ans 的该地址。
 */
const NEW_LIST_URL =
	'https://mooc2-ans.chaoxing.com/mooc2-ans/visit/interaction?moocDomain=https://mooc1-2.chaoxing.com/mooc-ans';

/**
 * 查找课程列表的真实地址（供 GM 直扫使用）：
 * 1) 页面里显式的 interaction 链接/iframe；mooc1-2 的壳地址换成真实列表地址
 * 2) 回退到新版门户标准课程列表地址（无需 token）
 */
function findCourseListUrl(): string | null {
	try {
		const el = document.querySelector<HTMLAnchorElement | HTMLIFrameElement>(
			'a[href*="/visit/interaction"], iframe[src*="/visit/interaction"]'
		);
		if (el) {
			const url = el.tagName === 'A' ? (el as HTMLAnchorElement).href : (el as HTMLIFrameElement).src;
			if (url) {
				// mooc1-2 的 interaction 是 JS 跳转壳，GM 拉回来没有课程，换成真实列表地址
				if (url.includes('mooc1-2.chaoxing.com/visit/interaction')) return NEW_LIST_URL;
				return url;
			}
		}
	} catch (e) {
		/* ignore */
	}
	// 新版门户标准课程列表地址（实测服务端渲染，cookie 认证即可）
	return NEW_LIST_URL;
}

/**
 * 页面结构自诊断：扫不到课程时输出关键信息，便于用户回报/定位问题。
 */
function documentDiagnostic(): string {
	const parts: string[] = [];
	parts.push('URL=' + location.href.slice(0, 90));
	try {
		parts.push('courseid锚点=' + document.querySelectorAll('a[href*="courseid="], a[href*="courseId="]').length);
		const iframes = Array.from(document.querySelectorAll('iframe'))
			.map((f) => (f.src || '').slice(0, 70))
			.slice(0, 3);
		if (iframes.length) parts.push('iframe=' + iframes.join('|'));
		const shadows = Array.from(document.querySelectorAll('*')).filter((el) => el.shadowRoot).length;
		if (shadows) parts.push('shadow=' + shadows);
		const sample = document.querySelector<HTMLElement>(
			'.course, .courseItem, [class*="course"], .lesson, .curriculum, [class*="schedule"]'
		);
		if (sample) {
			parts.push('样本=' + sample.outerHTML.slice(0, 300).replace(/\s+/g, ' '));
		} else {
			parts.push('样本=无');
		}
		parts.push('文本=' + (document.body ? document.body.innerText.replace(/\s+/g, ' ').slice(0, 80) : ''));
	} catch (e) {
		parts.push('诊断异常=' + String(e));
	}
	return parts.join(' | ');
}

/**
 * 从课程卡片文本中提取结束日期（支持 - . / 分隔符，～ ~ - 至 等连接符）。
 * 返回 YYYY-MM-DD，找不到返回 ''。
 */
function extractCourseEndDate(text: string): string {
	// 匹配形如：2026-09-17～2028-09-17 / 2026.9.17-2028.9.17 / 2026/09/17 至 2028/09/17
	const re = /(\d{4})[./-](\d{1,2})[./-](\d{1,2})\s*(?:～|~|—|至|到|~|~|-)\s*(\d{4})[./-](\d{1,2})[./-](\d{1,2})/;
	const m = text.match(re);
	if (!m) return '';
	const [, , , , ey, em, ed] = m;
	return ey + '-' + String(em).padStart(2, '0') + '-' + String(ed).padStart(2, '0');
}

/**
 * 旧课程识别：课程名里出现早于当前年份的年份（如 2023/2024/2025）视为已结课。
 * 当前年份的课程（2026级/2026年）不判定为旧课。
 */
function isOldCourseName(name: string): boolean {
	const year = new Date().getFullYear();
	const m = name.match(/(19|20)\d{2}/);
	if (!m) return false;
	const y = parseInt(m[0], 10);
	return y < year;
}

/** 顶层页面跳转（课程学习脚本运行在卡片 iframe 中，直接改 location 只会跳转 iframe） */
function navigateTop(url: string): void {
	try {
		if (window.top && window.top !== window) {
			window.top.location.href = url;
			return;
		}
	} catch (e) {
		/* 跨域则退回当前窗口 */
	}
	location.href = url;
}

type LogFn = (...msg: any[]) => void;

export const CXAutoStudy = {
	state: {
		scanning: false,
		courses: [] as AutoStudyCourse[],
		panel: undefined as HTMLElement | undefined,
		/** 最近一次渲染的面板容器与日志函数，供扫描完成后原地刷新 */
		renderContainer: undefined as HTMLElement | undefined,
		renderLog: undefined as LogFn | undefined,
		/** 选中的课程 key 集合（courseid_clazzid），默认全选可选的 */
		selected: new Set<string>(),
		/** 忽略的课程 key 集合（courseid_clazzid） */
		ignored: new Set<string>(),
		/** 用户手动设为可选的「已完成」课程 key 集合 */
		forceSelectable: new Set<string>(),
		/** 永久结课标记 key 集合与详情（内存仅存渲染所需副本，数据源为 GM 存储） */
		endedMarkers: new Map<string, EndedMarker>(),
		/** 永久完成标记 key 集合与详情 */
		doneMarkers: new Map<string, DoneMarker>()
	},

	/** 课程入口（委托 cx-context 统一构建） */
	studyUrlOf(c: { courseid: string; clazzid: string; cpi?: string }): string {
		return studyEntryUrlOf(c);
	},

	/** 章节树页地址（委托 cx-context 统一构建） */
	studentCourseUrlOf(c: { courseid: string; clazzid: string; cpi?: string }, enc: string): string {
		return studentCourseUrlOf(c, enc);
	},

	/** 从课程列表页 DOM 提取课程（去重） */
	scanCoursesFromDocument(doc: Document): (Omit<AutoStudyCourse, 'pending'> & { pending?: number })[] {
		const out: (Omit<AutoStudyCourse, 'pending'> & { pending?: number })[] = [];
		const seen = new Map<string, Omit<AutoStudyCourse, 'pending'> & { pending?: number }>();
		const addCourse = (cid: string, clz: string, cpi: string, el: Element) => {
			if (!cid || !clz) return;
			const key = cid + '_' + clz;
			const exist = seen.get(key);
			if (exist) return;
			// 课程卡片容器：精确到「只含本门课」的祖先，进度/结课标记才不会串到别的课
			const container = resolveCourseContainer(el);
			const containerText = container?.textContent || '';
			// 课程名取值链：自身 title → 卡片内 .course-name 系（title 或文本，接口 HTML 的名字在这里）
			// → data-title → 自身文本。接口返回的课程名在 <span class="course-name" title="..."> 内。
			const nameEl = el.querySelector('.course-name, .courseName, .course_title, [class*=name]');
			const name =
				el.getAttribute('title')?.trim() ||
				nameEl?.getAttribute('title')?.trim() ||
				nameEl?.textContent?.trim() ||
				container
					?.querySelector('.course-name, .courseName, .course_title, [class*=name]')
					?.getAttribute('title')
					?.trim() ||
				container?.querySelector('.course-name, .courseName, .course_title, [class*=name]')?.textContent?.trim() ||
				el.getAttribute('data-title')?.trim() ||
				el.textContent?.trim() ||
				'';
			// 解析开课时间的结束日期，已结课/去年课程不再扫描
			const dateText = containerText;
			const endDate = extractCourseEndDate(dateText);
			const realName = name || '';
			// 官方「课程已结束」标记（列表页直接标注，最可靠）
			const endedOfficial = /课程已结束|课程已关闭/.test(containerText);
			// 列表页「任务点进度: X/Y」——可直接算出未完成任务数，无需额外请求
			let progressDone: number | undefined;
			let progressTotal: number | undefined;
			const pm = containerText.match(/任务点进度[：:]\s*(\d+)\s*\/\s*(\d+)/);
			if (pm) {
				progressDone = parseInt(pm[1], 10);
				progressTotal = parseInt(pm[2], 10);
			}
			const item = {
				courseid: cid,
				clazzid: clz,
				cpi,
				name: realName || key,
				endDate,
				endedOfficial,
				progressDone,
				progressTotal,
				ended: endedOfficial
					? true
					: endDate
					? new Date(endDate + 'T23:59:59').getTime() < Date.now()
					: // 只有提取到真实课程名才按年份判断旧课；courseid 兜底名（可能以20开头）不能误判
					  !!realName && isOldCourseName(realName)
			};
			seen.set(key, item);
			out.push(item);
		};
		// 1) 课程入口链接：stucoursemiddle / mycourse/stu / 普通 courseid 链接
		doc
			.querySelectorAll<HTMLAnchorElement>(
				'a[href*="stucoursemiddle"], a[href*="mycourse/stu"], a[href*="courseid="], a[href*="courseId="]'
			)
			.forEach((a) => {
				const href = a.href || '';
				addCourse(
					href.match(/courseid=(\d+)/i)?.[1] || '',
					href.match(/clazzid=(\d+)/i)?.[1] || '',
					href.match(/cpi=(\d+)/i)?.[1] || '',
					a
				);
			});
		// 2) onclick 里带 courseid（新版门户的 JS 跳转卡片）
		if (out.length === 0) {
			doc
				.querySelectorAll<HTMLElement>(
					'[onclick*="courseid"], [onclick*="courseId"], [onclick*="stucoursemiddle"], [onclick*="mycourse/stu"]'
				)
				.forEach((el) => {
					const s = el.getAttribute('onclick') || '';
					addCourse(
						s.match(/courseid=(\d+)/i)?.[1] || '',
						s.match(/clazzid=(\d+)/i)?.[1] || '',
						s.match(/cpi=(\d+)/i)?.[1] || '',
						el
					);
				});
		}
		// 3) data 属性
		if (out.length === 0) {
			doc
				.querySelectorAll<HTMLElement>('[data-courseid], [data-course-id], [data-clazzid], [data-courseId]')
				.forEach((el) => {
					addCourse(
						el.getAttribute('data-courseid') ||
							el.getAttribute('data-course-id') ||
							el.getAttribute('data-courseId') ||
							'',
						el.getAttribute('data-clazzid') || '',
						el.getAttribute('data-cpi') || '',
						el
					);
				});
		}
		return out;
	},

	/**
	 * 统计课程未完成任务点数。
	 * 链路：stucoursemiddle（302 到课程首页，finalUrl 带 enc）
	 * → studentcourse?stuenc=enc（章节树页 HTML，服务端渲染）。
	 * 未完成任务点数字段：新版 .catalog_points_yi、老版 .orangeNew，两者都解析。
	 */
	async fetchCoursePending(courseid: string, clazzid: string, cpi?: string): Promise<number> {
		try {
			// 先用会话缓存的 enc 直接取章节树，省掉第一跳；无效再走完整链路
			const cached = encCache.get(courseid + '_' + clazzid);
			if (cached && Date.now() - cached.ts < ENC_TTL) {
				const treeUrl = this.studentCourseUrlOf({ courseid, clazzid, cpi }, cached.enc);
				const tree = await gmGet(treeUrl);
				if (isAntispiderHit(tree, treeUrl)) return -2;
				const sum = parseTreePending(tree.text);
				if (sum !== null) return sum;
			}
			const homeUrl = this.studyUrlOf({ courseid, clazzid, cpi });
			const home = await gmGet(homeUrl);
			if (isAntispiderHit(home, homeUrl)) return -2;
			const enc = new URL(home.finalUrl || '').searchParams.get('enc');
			if (!enc) return -1;
			const treeUrl = this.studentCourseUrlOf({ courseid, clazzid, cpi }, enc);
			const tree = await gmGet(treeUrl);
			if (isAntispiderHit(tree, treeUrl)) return -2;
			encCache.set(courseid + '_' + clazzid, { enc, ts: Date.now() });
			return parseTreePending(tree.text) ?? 0;
		} catch (e) {
			return -1;
		}
	},

	/**
	 * 反爬验证码处理浮层：内嵌验证页（跨域拒绝内嵌时可用新窗口打开），
	 * 用户完成验证后点「继续扫描」→ resolve(true)，脚本自动重试当前课程并接着扫。
	 * 返回 false 表示用户取消，扫描中止。
	 */
	showCaptchaOverlay(log: LogFn): Promise<boolean> {
		return new Promise((resolve) => {
			document.getElementById('cx-antispider-overlay')?.remove();
			const url = lastAntispiderUrl || COURSE_LIST_URL;
			const iframe = h('iframe', {
				src: url,
				style: { width: '100%', height: '420px', border: '1px solid #dcdfe6', borderRadius: '4px', background: '#fff' }
			}) as HTMLIFrameElement;
			const openBtn = $ui.button('🔓 新窗口打开验证页', { style: { flex: '1', padding: '6px' } });
			openBtn.onclick = () => window.open(url, '_blank');
			const okBtn = $ui.button('✅ 我已完成验证，继续扫描', { style: { flex: '1.6', padding: '6px' } });
			const cancelBtn = $ui.button('取消', { style: { flex: '0.7', padding: '6px' } });
			const box = h(
				'div',
				{
					id: 'cx-antispider-overlay',
					style: {
						position: 'fixed',
						top: '0',
						left: '0',
						right: '0',
						bottom: '0',
						zIndex: '999999',
						background: 'rgba(0,0,0,0.45)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center'
					}
				},
				[
					h(
						'div',
						{
							style: {
								width: '560px',
								maxWidth: '92vw',
								background: '#fff',
								borderRadius: '8px',
								padding: '14px',
								boxShadow: '0 8px 30px rgba(0,0,0,.2)'
							}
						},
						[
							h(
								'div',
								{ style: { fontSize: '15px', fontWeight: '600', color: '#303133', marginBottom: '8px' } },
								'⚠️ 需要完成超星安全验证'
							),
							h(
								'div',
								{ style: { fontSize: '13px', color: '#606266', lineHeight: '1.8', marginBottom: '8px' } },
								'扫描触发了超星反爬验证。下方已内嵌验证页；若显示空白（被拒绝内嵌），请点「新窗口打开验证页」。完成验证后点「继续扫描」，会自动重试当前课程并接着检测剩余课程。'
							),
							iframe,
							h('div', { style: { display: 'flex', gap: '8px', marginTop: '10px' } }, [openBtn, okBtn, cancelBtn])
						]
					)
				]
			);
			const finish = (solved: boolean) => {
				box.remove();
				resolve(solved);
			};
			okBtn.onclick = () => finish(true);
			cancelBtn.onclick = () => finish(false);
			document.body.appendChild(box);
			log('已弹出验证窗口，请完成验证后点击「我已完成验证，继续扫描」。');
		});
	},

	/**
	 * 获取课程列表文档（不跳转）：
	 * 1) 当前就在列表页且 DOM 已渲染课程 → 直接用当前文档（零请求）
	 * 2) 否则 POST 课程列表数据接口，拿回课程卡片 HTML 解析（一次请求）
	 * 3) 最后回退拉取列表页 HTML（旧版门户课程是服务端渲染时可用）
	 */
	async fetchListDocument(log: LogFn): Promise<Document | null> {
		// 1) 当前就在列表页且 DOM 里有课程
		if (isCourseListPage()) {
			const direct = this.scanCoursesFromDocument(document);
			if (direct.length) return document;
		}
		// 2) 课程列表数据接口（新版门户首选：课程由页面 JS 调该 POST 渲染，单次请求拿全量）
		try {
			log('正在直接拉取课程列表数据（不跳转）...');
			const rd = await gmPost(COURSE_LIST_DATA_URL, COURSE_LIST_DATA_BODY);
			if (isAntispiderHit(rd, COURSE_LIST_DATA_URL)) {
				log('⚠️ 拉取课程列表触发反爬验证码，请先打开课程列表页完成验证后重试。');
				return null;
			}
			const docD = new DOMParser().parseFromString(rd.text, 'text/html');
			if (this.scanCoursesFromDocument(docD).length) return docD;
			log('课程列表接口未返回课程（响应 ' + rd.text.length + ' 字符）。');
		} catch (e) {
			log('课程列表接口请求失败：' + String(e).slice(0, 80));
		}
		// 3) 回退：拉取列表页 HTML（旧版门户课程服务端渲染时可用）
		const target = findCourseListUrl();
		if (!target) {
			log('未找到课程列表页地址，请先点「打开课程列表页」。');
			return null;
		}
		log('回退：正在拉取课程列表页 HTML...');
		const r = await gmGet(target);
		if (isAntispiderHit(r, target)) {
			log('⚠️ 拉取课程列表触发反爬验证码，请先打开课程列表页完成验证后重试。');
			return null;
		}
		const doc = new DOMParser().parseFromString(r.text, 'text/html');
		const parsed = this.scanCoursesFromDocument(doc);
		if (!parsed.length) {
			// 诊断信息带上被拉取的地址与响应特征，便于区分「登录失效/结构变化」
			log(
				'课程列表页解析不到课程（' +
					target.slice(0, 80) +
					'，响应 ' +
					r.text.length +
					' 字符）。' +
					documentDiagnostic()
			);
			return null;
		}
		return doc;
	},

	/**
	 * 扫描全部课程的完成情况（不跳转）：
	 * 永久标记（结课/完成）零请求直判 → 列表页进度直判 → 上次扫描缓存 → 章节树链路实测。
	 * 检出结课即写永久标记；结果持久化，供下次直接使用。
	 */
	async scanUnfinished(log: LogFn): Promise<AutoStudyCourse[]> {
		const listDoc = await this.fetchListDocument(log);
		if (!listDoc) return this.state.courses;
		const base = this.scanCoursesFromDocument(listDoc);
		await Promise.all([
			this.loadIgnored(),
			this.loadForceSelectable(),
			this.loadEndedMarkers(),
			this.loadDoneMarkers()
		]);
		// 上一次扫描记录（持久缓存）：用于「全新课」标记与无进度课程的兜底
		let prevCache: AutoStudyCourse[] = [];
		try {
			const cached = await this.readScanCache();
			if (cached?.courses?.length) prevCache = cached.courses;
		} catch (e) {
			/* 忽略 */
		}
		const prevMap = new Map(prevCache.map((c) => [c.courseid + '_' + c.clazzid, c]));

		const courses: AutoStudyCourse[] = [];
		const needDetect: AutoStudyCourse[] = [];
		let endedCount = 0;
		let ignoredCount = 0;
		let newCount = 0;
		let markerEnded = 0;
		let markerDone = 0;
		const seenKeys = new Set<string>();
		for (const c of base) {
			const key = c.courseid + '_' + c.clazzid;
			seenKeys.add(key);
			const prev = prevMap.get(key);
			const isNew = !prev;
			if (isNew) newCount++;
			const forceSelectable = this.state.forceSelectable.has(key);
			if (this.state.ignored.has(key)) {
				courses.push({ ...(c as AutoStudyCourse), pending: 0, ignored: true, isNew, forceSelectable });
				ignoredCount++;
				continue;
			}
			// 永久结课标记：零请求直判
			const endedMarker = this.state.endedMarkers.get(key);
			if (endedMarker) {
				courses.push({
					...(c as AutoStudyCourse),
					pending: 0,
					ended: true,
					endedOfficial: true,
					isNew,
					forceSelectable
				});
				markerEnded++;
				continue;
			}
			if (c.ended) {
				// 检出结课 → 写永久标记，之后永不重复检测
				this.markEnded(
					{ courseid: c.courseid, clazzid: c.clazzid, name: c.name },
					c.endedOfficial ? '课程已结束（官方标记）' : '已过结束日期或往年课程'
				);
				courses.push({ ...(c as AutoStudyCourse), pending: 0, isNew, forceSelectable });
				endedCount++;
				continue;
			}
			// 列表页带「任务点进度 X/Y」：直接算未完成数，零额外请求（X/Y 为 0/0 表示无任务点，也算完成）
			if (c.progressTotal !== undefined && c.progressDone !== undefined) {
				const pending = Math.max(0, c.progressTotal - c.progressDone);
				if (pending === 0) {
					this.markDone({ courseid: c.courseid, clazzid: c.clazzid, name: c.name });
					markerDone++;
				}
				courses.push({ ...(c as AutoStudyCourse), pending, isNew, forceSelectable });
				continue;
			}
			// 无进度信息：先看持久缓存里上次的检测结果
			if (prev && prev.pending >= 0) {
				if (prev.pending === 0) {
					this.markDone({ courseid: c.courseid, clazzid: c.clazzid, name: c.name });
					markerDone++;
				}
				courses.push({ ...(c as AutoStudyCourse), pending: prev.pending, isNew, forceSelectable });
				continue;
			}
			// 都没有才走章节树链路实测
			const item = { ...(c as AutoStudyCourse), pending: -1, isNew, forceSelectable };
			courses.push(item);
			needDetect.push(item);
		}
		// 永久标记合并：课程从列表页消失后仍展示（零请求）
		for (const [key, m] of this.state.endedMarkers) {
			if (seenKeys.has(key)) continue;
			const [courseid, clazzid] = key.split('_');
			courses.push({
				courseid,
				clazzid,
				cpi: '',
				name: m.name,
				pending: 0,
				ended: true,
				endedOfficial: true,
				isNew: false
			});
			seenKeys.add(key);
			markerEnded++;
		}
		for (const [key, m] of this.state.doneMarkers) {
			if (seenKeys.has(key)) continue;
			const [courseid, clazzid] = key.split('_');
			courses.push({
				courseid,
				clazzid,
				cpi: '',
				name: m.name,
				pending: 0,
				isNew: false
			});
			seenKeys.add(key);
		}
		if (newCount) log('发现 ' + newCount + ' 门全新课程');
		if (endedCount) log(endedCount + ' 门已结课/往年课程，默认跳过');
		if (ignoredCount) log(ignoredCount + ' 门已忽略，跳过');
		if (markerEnded) log(markerEnded + ' 门命中永久结课标记（零请求）');
		if (markerDone) log(markerDone + ' 门已完成（写入永久完成标记）');
		// 只有无可复用信息的课程才发请求；串行 + 拟人延迟，避免风控
		for (const item of needDetect) {
			let pending = await this.fetchCoursePending(item.courseid, item.clazzid, item.cpi);
			if (pending === -2) {
				// 触发反爬：弹窗让用户完成验证，确认后重试当前课程并继续；取消则中止
				const solved = await this.showCaptchaOverlay(log);
				if (!solved) break;
				pending = await this.fetchCoursePending(item.courseid, item.clazzid, item.cpi);
				if (pending === -2) {
					log('⚠️ 验证仍未通过，扫描中止。请稍后重新扫描。');
					break;
				}
			}
			item.pending = pending;
			if (pending === 0) {
				this.markDone({ courseid: item.courseid, clazzid: item.clazzid, name: item.name });
			}
			log(item.name + '：' + (pending < 0 ? '检测失败' : pending === 0 ? '已完成' : '剩余 ' + pending + ' 个任务点'));
			await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 600));
		}
		// 持久化标记与扫描结果
		await this.saveEndedMarkers();
		await this.saveDoneMarkers();
		try {
			await $store.set(SCAN_CACHE_KEY, { ts: Date.now(), courses });
		} catch (e) {
			/* 缓存失败不影响使用 */
		}
		// 先写入 state 再初始化选中集，否则首扫时 initSelected 读到旧的空列表，导致「已选 0 门」
		this.state.courses = courses;
		this.initSelected();
		return courses;
	},

	/**
	 * 导出全部扫描记录为本地 JSON 文件（GM 存储之外的磁盘级备份）。
	 * 浏览器沙箱无法静默写盘，此处经用户下载保存。
	 */
	async exportRecords(): Promise<void> {
		const data: ScanRecordExport = {
			version: '4.15.4-zogice',
			exportedAt: Date.now(),
			scan: (await this.readScanCache()) || undefined,
			ignored: Array.from(this.state.ignored),
			forceSelectable: Array.from(this.state.forceSelectable),
			ended: Array.from(this.state.endedMarkers.values()),
			done: Array.from(this.state.doneMarkers.values())
		};
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = h('a', { href: url, download: 'ocs-课程扫描记录.json' });
		a.click();
		URL.revokeObjectURL(url);
	},

	/**
	 * 从本地 JSON 文件导入扫描记录（选择文件后整体还原）。
	 * 返回导入的课程数；失败返回 -1（真实错误会写入日志面板）。
	 */
	async importRecords(file: File): Promise<number> {
		try {
			const text = (await file.text()).replace(/^\uFEFF/, '');
			const data = JSON.parse(text) as ScanRecordExport;
			if (!data || typeof data !== 'object') {
				console.error('[ocs-import] 结构不是对象');
				return -1;
			}
			if (Array.isArray(data.ignored)) {
				await $store.set(IGNORED_KEY, data.ignored);
				this.state.ignored = new Set(data.ignored);
			}
			if (Array.isArray(data.forceSelectable)) {
				await $store.set(FORCE_SELECTABLE_KEY, data.forceSelectable);
				this.state.forceSelectable = new Set(data.forceSelectable);
			}
			if (Array.isArray(data.ended)) {
				await $store.set(ENDED_KEY, data.ended);
				this.state.endedMarkers = new Map(data.ended.map((m) => [m.key, m]));
			}
			if (Array.isArray(data.done)) {
				await $store.set(DONE_KEY, data.done);
				this.state.doneMarkers = new Map(data.done.map((m) => [m.key, m]));
			}
			if (data.scan && Array.isArray(data.scan.courses) && data.scan.courses.length) {
				await $store.set(SCAN_CACHE_KEY, { ts: data.scan.ts || Date.now(), courses: data.scan.courses });
				this.state.courses = data.scan.courses;
			}
			this.initSelected();
			return this.state.courses.length;
		} catch (e: any) {
			console.error('[ocs-import] 导入异常：', e);
			$console.error('导入失败详情：' + (e?.message || String(e)));
			return -1;
		}
	},

	/** 读取「扫描后自动导出」开关 */
	async readAutoExport(): Promise<boolean> {
		try {
			return (await $store.get(AUTO_EXPORT_KEY)) === true;
		} catch (e) {
			return false;
		}
	},

	async writeAutoExport(on: boolean): Promise<void> {
		try {
			await $store.set(AUTO_EXPORT_KEY, on);
		} catch (e) {
			/* ignore */
		}
	},

	/** 加载忽略列表 */
	async loadIgnored(): Promise<void> {
		try {
			const list = (await $store.get(IGNORED_KEY)) as string[] | undefined;
			this.state.ignored = new Set(Array.isArray(list) ? list : []);
		} catch (e) {
			this.state.ignored = new Set();
		}
	},

	/** 加载永久结课标记（数据源 GM 存储落盘，重启/重登均在） */
	async loadEndedMarkers(): Promise<void> {
		try {
			const list = (await $store.get(ENDED_KEY)) as EndedMarker[] | undefined;
			this.state.endedMarkers = new Map((Array.isArray(list) ? list : []).map((m) => [m.key, m]));
		} catch (e) {
			this.state.endedMarkers = new Map();
		}
	},

	async saveEndedMarkers(): Promise<void> {
		try {
			await $store.set(ENDED_KEY, Array.from(this.state.endedMarkers.values()));
		} catch (e) {
			/* ignore */
		}
	},

	/** 加载永久完成标记 */
	async loadDoneMarkers(): Promise<void> {
		try {
			const list = (await $store.get(DONE_KEY)) as DoneMarker[] | undefined;
			this.state.doneMarkers = new Map((Array.isArray(list) ? list : []).map((m) => [m.key, m]));
		} catch (e) {
			this.state.doneMarkers = new Map();
		}
	},

	async saveDoneMarkers(): Promise<void> {
		try {
			await $store.set(DONE_KEY, Array.from(this.state.doneMarkers.values()));
		} catch (e) {
			/* ignore */
		}
	},

	/** 标记单门课永久结课（已存在则更新原因） */
	markEnded(course: { courseid: string; clazzid: string; name: string }, reason: string): void {
		const key = course.courseid + '_' + course.clazzid;
		this.state.endedMarkers.set(key, { key, name: course.name, reason, ts: Date.now() });
	},

	/** 标记单门课永久完成 */
	markDone(course: { courseid: string; clazzid: string; name: string }): void {
		const key = course.courseid + '_' + course.clazzid;
		if (!this.state.doneMarkers.has(key)) {
			this.state.doneMarkers.set(key, { key, name: course.name, ts: Date.now() });
		}
	},

	/** 清除单门课的永久标记（结课+完成），返回是否清除了至少一项 */
	async clearMarkers(key: string): Promise<boolean> {
		let cleared = false;
		if (this.state.endedMarkers.delete(key)) cleared = true;
		if (this.state.doneMarkers.delete(key)) cleared = true;
		if (cleared) {
			await this.saveEndedMarkers();
			await this.saveDoneMarkers();
		}
		return cleared;
	},

	/** 保存忽略列表 */
	async saveIgnored(): Promise<void> {
		try {
			await $store.set(IGNORED_KEY, Array.from(this.state.ignored));
		} catch (e) {
			/* ignore */
		}
	},

	/** 切换忽略状态，返回是否已忽略 */
	async toggleIgnore(course: AutoStudyCourse, log: LogFn): Promise<boolean> {
		const key = course.courseid + '_' + course.clazzid;
		if (this.state.ignored.has(key)) {
			this.state.ignored.delete(key);
		} else {
			this.state.ignored.add(key);
		}
		await this.saveIgnored();
		course.ignored = this.state.ignored.has(key);
		if (course.ignored) this.state.selected.delete(key);
		else if (this.isSelectable(course)) this.state.selected.add(key);
		if (this.state.renderContainer) {
			this.renderInto(this.state.renderContainer, this.state.renderLog || log);
		}
		return course.ignored;
	},

	/** 加载「已完成设为可选」名单 */
	async loadForceSelectable(): Promise<void> {
		try {
			const list = (await $store.get(FORCE_SELECTABLE_KEY)) as string[] | undefined;
			this.state.forceSelectable = new Set(Array.isArray(list) ? list : []);
		} catch (e) {
			this.state.forceSelectable = new Set();
		}
	},

	/** 保存「已完成设为可选」名单 */
	async saveForceSelectable(): Promise<void> {
		try {
			await $store.set(FORCE_SELECTABLE_KEY, Array.from(this.state.forceSelectable));
		} catch (e) {
			/* ignore */
		}
	},

	/**
	 * 课程是否可选择刷课：
	 * 未结课、未忽略、已检测出结果；其中「已完成」课程需用户手动设为可选才解锁。
	 */
	isSelectable(c: AutoStudyCourse): boolean {
		if (c.ended || c.ignored || c.pending < 0) return false;
		if (c.pending === 0 && !c.forceSelectable) return false;
		return true;
	},

	/** 切换「已完成」课程的可选状态（灰色锁定 ↔ 可勾选） */
	async toggleForceSelectable(course: AutoStudyCourse, log: LogFn): Promise<boolean> {
		const key = course.courseid + '_' + course.clazzid;
		if (this.state.forceSelectable.has(key)) {
			this.state.forceSelectable.delete(key);
		} else {
			this.state.forceSelectable.add(key);
		}
		await this.saveForceSelectable();
		course.forceSelectable = this.state.forceSelectable.has(key);
		if (course.forceSelectable) this.state.selected.add(key);
		else this.state.selected.delete(key);
		if (this.state.renderContainer) {
			this.renderInto(this.state.renderContainer, this.state.renderLog || log);
		}
		return course.forceSelectable;
	},

	/** 初始化选中状态：默认全选可选择的课程（未完成 + 用户解锁的已完成） */
	initSelected(): void {
		const keys = this.state.courses.filter((c) => this.isSelectable(c)).map((c) => c.courseid + '_' + c.clazzid);
		this.state.selected = new Set(keys);
	},

	/** 读取扫描缓存（持久有效：扫描过一次就记录，仅手动扫描才更新） */
	async readScanCache(): Promise<{ ts: number; courses: AutoStudyCourse[] } | undefined> {
		try {
			const cached = (await $store.get(SCAN_CACHE_KEY)) as { ts: number; courses: AutoStudyCourse[] } | undefined;
			if (cached && cached.courses?.length) return cached;
		} catch (e) {
			/* ignore */
		}
		return undefined;
	},

	async readState(): Promise<AutoStudyState | undefined> {
		try {
			const s = (await $store.get(STORE_KEY)) as AutoStudyState | undefined;
			// 0 或非对象都视为无状态
			return s && typeof s === 'object' && s.running !== undefined ? s : undefined;
		} catch (e) {
			return undefined;
		}
	},

	async writeState(state: AutoStudyState | undefined): Promise<void> {
		try {
			// 注意：不能用 undefined 清除（TM 会存成字符串 "undefined" 变成真值），用 0 表示清除
			await $store.set(STORE_KEY, state || 0);
		} catch (e) {
			/* ignore */
		}
	},

	async isRunning(): Promise<boolean> {
		const s = await this.readState();
		return !!s?.running;
	},

	/** 开始：保存队列并跳转到第一门待刷课程（未完成，或用户手动解锁的已完成课程） */
	async start(courses: AutoStudyCourse[], log: LogFn): Promise<void> {
		// 调用方已按 isSelectable + 勾选过滤；这里只兜底排除非法项。
		// 用户手动解锁的「已完成」课程也允许进入（强制复习场景）。
		const queue = courses.filter((c) => this.isSelectable(c));
		if (!queue.length) {
			$message.success('所有课程都已完成，无需刷课');
			return;
		}
		await this.writeState({ running: true, index: 0, queue, ts: Date.now() });
		log('开始自动刷课：共 ' + queue.length + ' 门，正在进入「' + queue[0].name + '」');
		navigateTop(this.studyUrlOf(queue[0]));
	},

	async stop(log: LogFn): Promise<void> {
		const s = await this.readState();
		await this.writeState(s ? { ...s, running: false } : undefined);
		log('自动刷课已停止：当前课程会继续完成，但不再自动跳转下一门');
	},

	/**
	 * 一门课全部任务点完成后的回调（由课程学习脚本在完成分支调用）。
	 * 返回 true 表示已接管后续流程（跳转下一门或结束），调用方不要再弹「全部完成」提示。
	 */
	async onCourseFinished(log: LogFn): Promise<boolean> {
		const s = await this.readState();
		if (!s?.running || !s.queue?.length) return false;
		const next = s.index + 1;
		if (next < s.queue.length) {
			await this.writeState({ ...s, index: next, ts: Date.now() });
			const c = s.queue[next];
			log(
				'「' +
					(s.queue[s.index]?.name || '当前课程') +
					'」已完成，进入下一门：' +
					c.name +
					'（' +
					(next + 1) +
					'/' +
					s.queue.length +
					'）'
			);
			await new Promise((resolve) => setTimeout(resolve, 3000));
			navigateTop(this.studyUrlOf(c));
		} else {
			await this.writeState({ ...s, running: false });
			$message.success({ content: '全部课程任务点已完成！', duration: 0 });
			log('全部课程任务点已完成！');
		}
		return true;
	},

	/**
	 * 课程首页（新版门户）钩子：自动刷课运行中时自动点击「章节」标签，
	 * 触发 studentcourse iframe 加载（脚本会在该 iframe 里继续接力）。
	 */
	/** 当前页面课程是否为队列中应刷的那门（防止误操作用户手动打开的其他课程） */
	async isExpectedCourse(log?: LogFn): Promise<boolean> {
		const s = await this.readState();
		if (!s?.running || !s.queue?.length) return false;
		const cur = s.queue[s.index];
		if (!cur) return false;
		const href = location.href;
		return href.includes('courseid=' + cur.courseid) && href.includes('clazzid=' + cur.clazzid);
	},

	async onCourseHome(log: LogFn): Promise<void> {
		if (!(await this.isExpectedCourse())) return;
		log('自动刷课：已进入课程首页，正在打开章节页...');
		await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 2000));
		const tab = Array.from(document.querySelectorAll<HTMLElement>('span.nav_content')).find(
			(el) => el.textContent?.trim() === '章节'
		);
		tab?.click();
	},

	/**
	 * 章节树页（studentcourse iframe 内）钩子：自动刷课运行中时，
	 * 自动点击第一个未完成章节（chapter_item），跳转到老版学习页，交给课程学习脚本。
	 */
	async onStudentCourse(log: LogFn): Promise<void> {
		if (!(await this.isExpectedCourse())) return;
		log('自动刷课：章节页已加载，正在进入第一个未完成章节...');
		await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 2000));
		const items = Array.from(document.querySelectorAll<HTMLElement>('.chapter_item[id^="cur"]'));
		// 无章节条目（课程未发布内容）或全部已完成：直接跳到下一门，避免卡死
		const hasPending = items.some((el) => {
			const points = el.querySelector<HTMLElement>('.catalog_points_yi');
			return points && (parseInt(points.textContent?.trim() || '0', 10) || 0) > 0;
		});
		if (!items.length || !hasPending) {
			log('自动刷课：' + (!items.length ? '该课程暂无章节内容' : '该课程任务点已全部完成') + '，跳过');
			await this.onCourseFinished(log);
			return;
		}
		items
			.find((el) => {
				const points = el.querySelector<HTMLElement>('.catalog_points_yi');
				return points && (parseInt(points.textContent?.trim() || '0', 10) || 0) > 0;
			})
			?.click();
	},

	/**
	 * 将自动刷课界面渲染到 OCS 主悬浮窗的脚本面板中（面板切换时会重复渲染，此处幂等重建）。
	 */
	renderInto(container: HTMLElement, log: LogFn): void {
		const listEl = h('div', {
			style: { maxHeight: '240px', overflow: 'auto', margin: '8px 0', fontSize: '12px', lineHeight: '1.8' }
		});
		const statusEl = h('div', { style: { fontSize: '12px', color: '#666', marginBottom: '6px' } }, '未扫描');

		// 全选框：只作用于可选课程（未结课/未忽略/已检测出结果），勾选状态随列表同步
		const selectAllCb = h('input', { type: 'checkbox' }) as HTMLInputElement;
		const selectAllText = h('span', {}, '全选');
		const selectAllLabel = h(
			'label',
			{
				style: {
					display: 'inline-flex',
					alignItems: 'center',
					gap: '4px',
					fontSize: '12px',
					color: '#666',
					cursor: 'pointer',
					userSelect: 'none',
					whiteSpace: 'nowrap'
				}
			},
			[selectAllCb, selectAllText]
		);
		selectAllCb.addEventListener('change', () => {
			const selectable = this.state.courses.filter((c) => this.isSelectable(c));
			for (const c of selectable) {
				const key = c.courseid + '_' + c.clazzid;
				if (selectAllCb.checked) this.state.selected.add(key);
				else this.state.selected.delete(key);
			}
			renderList(this.state.courses);
		});

		const startBtn = $ui.button('▶️ 开始刷课', { style: { flex: '1', padding: '4px' } });
		const scanBtn = $ui.button('🔃 扫描课程', { style: { flex: '1', padding: '4px' } });

		const refreshStartBtn = async () => {
			startBtn.value = (await this.isRunning()) ? '⏹ 结束' : '▶️ 开始刷课';
		};

		const renderList = (courses: AutoStudyCourse[]) => {
			// 排序：未完成在前，已完成其次，已忽略/已结课/检测失败最后；同级按 pending 降序
			const sorted = [...courses].sort((a, b) => {
				const rank = (c: AutoStudyCourse) => (c.ended || c.ignored || c.pending < 0 ? 4 : c.pending === 0 ? 2 : 1);
				const r = rank(a) - rank(b);
				return r !== 0 ? r : b.pending - a.pending;
			});
			const undone = courses.filter((c) => c.pending > 0).length;
			const done = courses.filter((c) => c.pending === 0 && !c.ended && !c.ignored).length;
			const fresh = courses.filter((c) => c.isNew && !c.ended && !c.ignored).length;
			const ended = courses.filter((c) => c.ended || c.ignored).length;
			const failed = courses.filter((c) => c.pending < 0).length;
			const selectable = courses.filter((c) => this.isSelectable(c));
			const selectedCount = selectable.filter((c) => this.state.selected.has(c.courseid + '_' + c.clazzid)).length;
			// 同步全选框：全选中打勾，部分选中半选
			selectAllCb.checked = selectable.length > 0 && selectedCount === selectable.length;
			selectAllCb.indeterminate = selectedCount > 0 && selectedCount < selectable.length;
			selectAllText.textContent = '全选 ' + selectedCount + '/' + selectable.length;
			selectAllLabel.style.display = courses.length ? '' : 'none';
			statusEl.textContent = courses.length
				? '共 ' +
				  courses.length +
				  ' 门：未完成 ' +
				  undone +
				  '，已完成 ' +
				  done +
				  '，已选 ' +
				  selectedCount +
				  ' 门' +
				  (fresh ? '，全新 ' + fresh + ' 门' : '') +
				  (ended ? '，已跳过 ' + ended + ' 门' : '') +
				  (failed ? '，检测失败 ' + failed + ' 门' : '')
				: '暂无课程记录，点「扫描课程」直接扫描（无需打开课程列表页）';
			goListBtn.style.display = courses.length ? 'none' : '';
			listEl.replaceChildren(
				...sorted.map((c) => {
					const key = c.courseid + '_' + c.clazzid;
					const selectableRow = this.isSelectable(c);
					const locked = !selectableRow;
					const checked = selectableRow && this.state.selected.has(key);
					// 行样式：已忽略/已结课/检测失败/已完成(未解锁) 灰色；未完成标色加粗
					const rowStyle: Record<string, string> = {
						whiteSpace: 'nowrap',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						fontSize: '12px',
						lineHeight: '1.9'
					};
					if (locked) rowStyle.color = '#999';
					const nameStyle: Record<string, string> = {};
					if (c.pending > 0) {
						nameStyle.color = '#e6a23c';
						nameStyle.fontWeight = '600';
					}
					const checkbox = h('input', { type: 'checkbox', checked, disabled: locked }) as HTMLInputElement;
					checkbox.addEventListener('change', () => {
						if (locked) return;
						if (checkbox.checked) this.state.selected.add(key);
						else this.state.selected.delete(key);
						renderList(this.state.courses);
					});
					// 已完成课程：提供「可选/锁定」切换（默认灰色不可选）
					let extraBtn: HTMLButtonElement | undefined;
					if (c.pending === 0 && !c.ended && !c.ignored) {
						extraBtn = h(
							'button',
							{
								style: {
									marginLeft: '6px',
									fontSize: '11px',
									padding: '0 4px',
									border: 'none',
									background: c.forceSelectable ? '#e6a23c' : '#909399',
									color: '#fff',
									borderRadius: '3px',
									cursor: 'pointer'
								}
							},
							c.forceSelectable ? '锁定' : '可选'
						) as HTMLButtonElement;
						extraBtn.onclick = () => this.toggleForceSelectable(c, log);
					}
					// 永久标记课程：提供「清除标记」（结课/完成标记清空后可重新检测）
					let clearMarkerBtn: HTMLButtonElement | undefined;
					if (this.state.endedMarkers.has(key) || this.state.doneMarkers.has(key)) {
						clearMarkerBtn = h(
							'button',
							{
								title: '清除永久标记并重新检测该课程',
								style: {
									marginLeft: '6px',
									fontSize: '11px',
									padding: '0 4px',
									border: 'none',
									background: '#67c23a',
									color: '#fff',
									borderRadius: '3px',
									cursor: 'pointer'
								}
							},
							'清除标记'
						) as HTMLButtonElement;
						clearMarkerBtn.onclick = () => {
							(async () => {
								await this.clearMarkers(key);
								log('已清除「' + c.name + '」的永久标记，正在重新检测...');
								const pending = await this.fetchCoursePending(c.courseid, c.clazzid, c.cpi);
								c.pending = pending;
								c.ended = false;
								c.endedOfficial = false;
								if (pending === 0) this.markDone({ courseid: c.courseid, clazzid: c.clazzid, name: c.name });
								await this.saveDoneMarkers();
								log(
									'「' +
										c.name +
										'」重新检测结果：' +
										(pending < 0 ? '检测失败' : pending === 0 ? '已完成' : '剩余 ' + pending + ' 个任务点')
								);
								renderList(this.state.courses);
							})();
						};
					}
					const ignoreBtn = h(
						'button',
						{
							style: {
								marginLeft: '6px',
								fontSize: '11px',
								padding: '0 4px',
								border: 'none',
								background: c.ignored ? '#67c23a' : '#f56c6c',
								color: '#fff',
								borderRadius: '3px',
								cursor: 'pointer'
							}
						},
						c.ignored ? '恢复' : '忽略'
					) as HTMLButtonElement;
					ignoreBtn.onclick = () => this.toggleIgnore(c, log);
					// 状态徽标：全新/未完成/已完成/已结课/已忽略/检测失败
					const badge = c.ended
						? c.endedOfficial
							? '（课程已结束·永久）'
							: '（已结课·永久）'
						: c.ignored
						? '（已忽略）'
						: c.pending < 0
						? '（检测失败·跳过）'
						: c.pending === 0
						? '（已完成' +
						  (c.progressTotal ? ' ' + c.progressDone + '/' + c.progressTotal : '') +
						  (c.forceSelectable ? '·已设为可选' : '') +
						  '）'
						: '（剩 ' + c.pending + (c.progressTotal ? '/' + c.progressTotal : '') + '）';
					const newBadge =
						c.isNew && !c.ended && !c.ignored
							? h('span', { style: { color: '#f56c6c', fontSize: '10px', marginLeft: '4px' } }, '全新')
							: undefined;
					return h(
						'div',
						{ style: rowStyle },
						[
							checkbox,
							h('span', { style: nameStyle }, ' ' + c.name + ' '),
							newBadge,
							h('span', { style: { color: locked ? '#999' : c.pending > 0 ? '#e6a23c' : '#67c23a' } }, badge),
							extraBtn,
							clearMarkerBtn,
							ignoreBtn
						].filter(Boolean) as HTMLElement[]
					);
				})
			);
		};

		scanBtn.onclick = async () => {
			if (this.state.scanning) return;
			statusEl.textContent = '扫描中（直接拉取课程列表，不跳转）...';
			await this.requestScan(log);
			renderList(this.state.courses);
			// 扫描失败时列表为空，明确提示去看日志，避免误以为「没有课程」
			if (!this.state.courses.length) {
				statusEl.textContent = '扫描失败，详情见日志面板（📄）';
			} else if (await this.readAutoExport()) {
				try {
					await this.exportRecords();
					log('已自动导出扫描记录文件（ocs-课程扫描记录.json）');
				} catch (e) {
					/* 导出失败不影响扫描 */
				}
			}
		};

		startBtn.onclick = async () => {
			if (await this.isRunning()) {
				await this.stop(log);
			} else {
				if (!this.state.courses.length) {
					statusEl.textContent = '请先扫描课程';
					scanBtn.click();
					return;
				}
				// 只刷勾选的课程（忽略/结课/检测失败/未解锁的已完成不可选）
				const selected = this.state.courses.filter(
					(c) => this.isSelectable(c) && this.state.selected.has(c.courseid + '_' + c.clazzid)
				);
				if (!selected.length) {
					statusEl.textContent = '未勾选任何课程，请先勾选';
					return;
				}
				await this.start(selected, log);
			}
			await refreshStartBtn();
		};

		// 只更新自己的容器节点，保留面板原有的配置区
		const goListBtn = $ui.button('📚 打开课程列表页', { style: { flex: '1', padding: '4px' } });
		goListBtn.onclick = async () => {
			statusEl.textContent = '正在前往课程列表页...';
			const target = findCourseListUrl() || COURSE_LIST_URL;
			navigateTop(target);
		};

		// 本地 JSON 文件备份：导出/导入（油猴存储被清后可一键还原）
		const exportBtn = $ui.button('📤 导出记录', { style: { flex: '1', padding: '4px' } });
		exportBtn.onclick = () => {
			this.exportRecords();
			log('已导出扫描记录（ocs-课程扫描记录.json，含忽略/永久标记/扫描结果）');
		};
		const importBtn = $ui.button('📥 导入记录', { style: { flex: '1', padding: '4px' } });
		importBtn.onclick = () => {
			const input = h('input', { type: 'file', accept: '.json' }) as HTMLInputElement;
			input.onchange = () => {
				const file = input.files?.[0];
				if (!file) return;
				(async () => {
					const n = await this.importRecords(file);
					if (n >= 0) {
						$message.success({ content: '记录导入成功：' + n + ' 门课程', duration: 5 });
						log('记录导入成功：' + n + ' 门课程（扫描结果/忽略/永久标记已还原）');
						renderList(this.state.courses);
					} else {
						$message.error({ content: '导入失败：文件格式不正确', duration: 5 });
					}
				})();
			};
			input.click();
		};
		const autoExportCb = h('input', { type: 'checkbox' }) as HTMLInputElement;
		const autoExportLabel = h(
			'label',
			{
				title: '每次扫描成功后自动下载一份记录 JSON 文件到本地',
				style: {
					display: 'inline-flex',
					alignItems: 'center',
					gap: '4px',
					fontSize: '12px',
					color: '#666',
					cursor: 'pointer',
					userSelect: 'none',
					whiteSpace: 'nowrap'
				}
			},
			[autoExportCb, '扫描后自动导出']
		);
		this.readAutoExport().then((on) => (autoExportCb.checked = on));
		autoExportCb.addEventListener('change', () => {
			this.writeAutoExport(autoExportCb.checked);
			log('扫描后自动导出：' + (autoExportCb.checked ? '已开启' : '已关闭'));
		});

		const wrap = h('div', { className: 'cx-auto-study-wrap', style: { marginTop: '8px' } }, [
			h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' } }, [
				statusEl,
				selectAllLabel
			]),
			listEl,
			h('div', { style: { display: 'flex', gap: '6px' } }, [scanBtn, startBtn]),
			h('div', { style: { display: 'flex', gap: '6px', alignItems: 'center' } }, [
				exportBtn,
				importBtn,
				autoExportLabel
			]),
			goListBtn
		]);
		const old = container.querySelector(':scope > .cx-auto-study-wrap');
		if (old) {
			old.replaceWith(wrap);
		} else {
			container.appendChild(wrap);
		}

		// 保存渲染上下文，供扫描完成后原地刷新面板
		this.state.renderContainer = container;
		this.state.renderLog = log;

		refreshStartBtn();
		// 不自动扫描：展示已记录的结果（扫描过一次就留着，下次直接用）；
		// 只有用户点「扫描课程」才更新。置顶会话内的即时结果优先。
		if (this.state.courses.length) {
			renderList(this.state.courses);
		} else {
			Promise.all([
				this.readScanCache(),
				this.loadIgnored(),
				this.loadForceSelectable(),
				this.loadEndedMarkers(),
				this.loadDoneMarkers()
			]).then(([cached]) => {
				if (cached) {
					this.state.courses = cached.courses;
					this.initSelected();
					renderList(cached.courses);
					const mins = Math.max(1, Math.round((Date.now() - cached.ts) / 60000));
					statusEl.textContent +=
						'（' + (mins >= 60 ? Math.round(mins / 60) + ' 小时' : mins + ' 分钟') + '前扫描，点「扫描课程」更新）';
				} else {
					statusEl.textContent = '暂无课程记录，点「扫描课程」直接扫描（无需打开课程列表页）';
				}
			});
		}
	},

	/**
	 * 点击「扫描课程」：不跳转，直接扫描。
	 * 已在课程列表页 → 解析当前 DOM；否则 GM 拉取课程列表页 HTML 解析。
	 */
	async requestScan(log: LogFn): Promise<void> {
		if (this.state.scanning) return;
		this.state.scanning = true;
		try {
			this.state.courses = await this.scanUnfinished(log);
		} finally {
			this.state.scanning = false;
		}
	}
};
