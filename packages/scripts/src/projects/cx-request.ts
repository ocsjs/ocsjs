/** global GM_xmlhttpRequest */

import { $ } from '@ocsjs/core';
import { $gm, $store } from 'easy-us';
import { $console } from './background';
import {
	buildReportUrl,
	extractMArg,
	getCookie,
	isPassedBody,
	planPoints,
	runConcurrentPool,
	RequestAttachment,
	RequestDefaults
} from './cx-request-core';

/**
 * 超星音视频任务点：不播放，直接按播放器协议上报进度
 *
 * 协议与字段顺序见 ./cx-request-core；这里负责页面取数、请求与并发调度。
 *
 * 服务端按「真实经过的时间」判定进度（实测：585 秒的进度 4 秒内灌完 → HTTP 200 但 isPassed:false），
 * 所以单个视频仍按 paceFactor 真实等待，并发数只用来同时推进多个不同视频。
 */

/** 已完成视频的 objectId，存在标签页存储里，刷新/切章节后不重复上报 */
const PASSED_KEY = 'cx-request-passed';

/** 日志同时进 OCS 后台日志面板（只留最近 50 条）和浏览器控制台（全量） */
function log(level: 'log' | 'warn' | 'error', ...msg: any[]) {
	try {
		$console[level](...msg);
	} catch (e) {
		/* 日志面板没就绪时只走控制台 */
	}
	const line = ['[ocs发包]', ...msg].join(' ');
	if (level === 'error') console.error(line);
	else if (level === 'warn') console.warn(line);
	else console.log(line);
}

export type RequestOptions = {
	/** 同时上报的视频任务数 */
	concurrency: number;
	/** 1.0 = 声明多少秒就真实等多少秒；调小更快，但服务端可能只回 200 不算完成 */
	paceFactor: number;
	/** 跳过目录上显示已完成的章节 */
	skipFinished: boolean;
};

type RequestTask = {
	tag: string;
	defaults: RequestDefaults;
	attachment: RequestAttachment;
};

/** 同源请求：优先 fetch（自动带 cookie），失败回退 GM_xmlhttpRequest */
async function httpText(url: string): Promise<{ status: number; text: string }> {
	try {
		const r = await fetch(url, { credentials: 'include' });
		return { status: r.status, text: await r.text() };
	} catch (e) {
		return new Promise((resolve, reject) => {
			// eslint-disable-next-line no-undef
			GM_xmlhttpRequest({
				method: 'GET',
				url,
				withCredentials: true,
				timeout: 30000,
				onload: (r: any) => resolve({ status: r.status, text: r.responseText || '' }),
				onerror: () => reject(new Error('GM_xmlhttpRequest error')),
				ontimeout: () => reject(new Error('timeout'))
			} as any);
		});
	}
}

export const CXRequest = {
	state: {
		total: 0,
		ok: 0,
		fail: 0,
		skip: 0,
		running: 0,
		stop: false,
		/** 检测到抓拍/人脸识别，本次发包拒绝执行 */
		blocked: false,
		/** 结束/中止原因，用于面板与通知 */
		note: '',
		/** 正在上报的任务：tag → 当前动作 */
		active: new Map<string, string>(),
		passed: new Set<string>()
	},

	async loadPassed() {
		try {
			const list = (await $store.getTab(PASSED_KEY)) as string[] | undefined;
			list?.forEach((id) => this.state.passed.add(id));
		} catch (e) {
			/* 不可用时只靠本次会话去重 */
		}
	},

	markPassed(objectId: string) {
		this.state.passed.add(objectId);
		try {
			// 不 await：持久化失败或卡住都不该挡住正在跑的上报
			$store.setTab(PASSED_KEY, Array.from(this.state.passed));
		} catch (e) {
			/* ignore */
		}
	},

	stop() {
		this.state.stop = true;
	},

	/**
	 * 是否启用了抓拍/人脸识别（发包模式只在没人脸识别时可用）
	 *
	 * 完整门控（反混淆源码 videojs-ext 的 timeupdate 分支）：
	 * isSupportFace && isShowFaceCollection && chapterCapture == 1 && playingCapture == 1
	 * 另加 DOM 兜底：服务端没渲染遮罩时抓拍链路根本不启动，所以以 DOM 为准更可靠。
	 */
	isFaceRequired(def: RequestDefaults) {
		return (
			(!!def.isSupportFace &&
				!!def.isShowFaceCollection &&
				Number(def.chapterCapture) === 1 &&
				Number(def.playingCapture) === 1) ||
			!!top?.document.getElementById('chapterFaceState') ||
			!!top?.document.querySelector('.maskDiv1, .chapterVideoFaceMaskDiv, .chapterVideoFaceQrMaskDiv')
		);
	},

	/**
	 * 取 dtoken
	 *
	 * 反混淆源码 index.js：
	 *   Ext.Ajax.request({url:'/ananas/status/'+objectId+'?k='+getCookie('fid')+'&flag=normal&ro=0'})
	 *   switch(resp.status){ case 'success': cfg.dtoken = resp.dtoken; ... }
	 * 只有 status === 'success' 时 dtoken 才有效；k 取的是 fid cookie，不是课程 fid。
	 */
	async fetchDtoken(attachment: RequestAttachment, defaults: RequestDefaults) {
		const objectId = attachment.objectId;
		const fid = getCookie('fid') || defaults.fid || '';
		const url = `/ananas/status/${objectId}?k=${fid}&flag=normal&ro=0`;
		let why = '未知';

		for (let attempt = 1; attempt <= 3; attempt++) {
			try {
				const r = await httpText(url);
				let j: any = null;
				try {
					j = JSON.parse(r.text);
				} catch (e) {
					j = null;
				}

				if (r.status !== 200) {
					why = `HTTP ${r.status}`;
				} else if (!j) {
					why = /passport|login|登录/i.test(r.text)
						? '会话已过期，响应是登录页'
						: `响应非 JSON：${r.text.slice(0, 80)}`;
				} else if (j.status === 'success' && j.dtoken) {
					// duration 取自这里 —— 上报的 &duration= 与 enc 用的都是它，
					// 而不是 attachment.attDuration（播放器里两者是不同来源，可能不等）
					const dur = parseInt(j.duration, 10);
					return { dtoken: j.dtoken as string, duration: isFinite(dur) && dur > 0 ? dur : undefined };
				} else {
					why = `status=${j.status} ${j.msgs || j.msg || j.message || ''}`.trim();
				}
			} catch (e) {
				why = String((e as Error).message || e);
			}
			if (attempt < 3) {
				await $.sleep(500 * attempt);
			}
		}

		log('error', `${objectId} 取 dtoken 失败 → ${why}`);
		return { dtoken: null, duration: undefined as number | undefined };
	},

	/**
	 * 重放一个视频的进度上报
	 *
	 * 202/302 = 会话失效（播放器此时会刷新页面）；403 且 body 含 code=20 = 单次学习时长上限。
	 */
	async completeVideo(task: RequestTask, opts: RequestOptions) {
		const { attachment: att, defaults: def } = task;
		const { tag } = task;
		const objectId = att.objectId as string;
		const jobid = att.jobid || att.property?._jobid || att.property?.jobid || '';
		const attDur = parseInt(String(att.attDuration ?? ''), 10) || 0;

		if (!def.reportUrl || !def.clazzId || !def.userid) {
			log('error', `${tag} 缺少上报上下文（reportUrl/clazzId/userid），跳过`);
			return false;
		}
		if (this.isFaceRequired(def)) {
			log('warn', `${tag} 该课程已启用抓拍/人脸识别，发包模式不适用，请手动播放该节`);
			return false;
		}

		const { dtoken, duration: statusDuration } = await this.fetchDtoken(att, def);
		if (!dtoken) {
			return false;
		}
		const duration = statusDuration || attDur;
		if (!duration) {
			log('error', `${tag} 无时长，跳过`);
			return false;
		}

		const base = {
			reportUrl: def.reportUrl,
			clazzId: String(def.clazzId),
			userid: String(def.userid),
			jobid: String(jobid),
			objectId,
			duration,
			clipTime: `${att.startTime || '0'}_${att.endTime || duration}`,
			otherInfo: att.otherInfo || '',
			rt: att.rt || def.rt || 0.9,
			videoFaceCaptureEnc: att.videoFaceCaptureEnc || '',
			attDuration: attDur || duration,
			attDurationEnc: att.attDurationEnc || ''
		};
		const pts = planPoints(duration, Number(def.reportTimeInterval) || 60);

		let dtokenNow = dtoken;
		let consecutiveFail = 0;
		let lastStatus = 0;
		let lastBody = '';

		this.state.active.set(tag, `0/${duration}s`);
		log('log', `${tag} 开始上报：${duration}s，约需 ${Math.round((duration * opts.paceFactor) / 60)} 分钟`);
		try {
			for (let i = 0; i < pts.length; i++) {
				if (this.state.stop) {
					return false;
				}
				const { t, isdrag } = pts[i];
				let status = 0;
				let body = '';
				try {
					const r = await httpText(buildReportUrl({ ...base, dtoken: dtokenNow, playingTime: t, isdrag }));
					status = r.status;
					body = r.text;
				} catch (e) {
					log('error', `${tag} 上报异常 t=${t}s：${String((e as Error).message || e)}`);
				}

				if (isPassedBody(body)) {
					log('log', `${tag} 完成 @ ${t}/${duration}s`);
					this.state.ok++;
					this.markPassed(objectId);
					return true;
				}
				if (status === 202 || status === 302) {
					this.state.note = `会话已失效（HTTP ${status}），请重新登录后刷新页面重跑`;
					log('error', `${tag} ${this.state.note}`);
					this.stop();
					this.state.fail++;
					return false;
				}
				if (status === 403 && /code=20/.test(body)) {
					const m = body.match(/\[restTime:(\d+)\]/);
					const rest = m ? Math.ceil(+m[1] / 60) : 0;
					this.state.note = `服务端限制单次学习时长，需休息 ${rest || '若干'} 分钟后继续`;
					log('warn', `${tag} ${this.state.note}`);
					this.state.fail++;
					return false;
				}
				if (status !== 200) {
					log('error', `${tag} 上报 HTTP ${status} t=${t}s：${body.slice(0, 120)}`);
					this.state.active.set(tag, `HTTP ${status}，重试中`);
					// dtoken 可能过期 —— 官方播放器每次加载只取一次，这里失败即自动续期
					if (++consecutiveFail >= 2) {
						const fresh = await this.fetchDtoken(att, def);
						if (fresh.dtoken && fresh.dtoken !== dtokenNow) {
							dtokenNow = fresh.dtoken;
							log('log', `${tag} 已自动更新 dtoken`);
						}
						consecutiveFail = 0;
					}
					lastStatus = status;
					lastBody = body;
					await $.sleep(250);
					continue;
				}

				consecutiveFail = 0;
				lastStatus = status;
				lastBody = body;

				// 成功一条 → 按 paceFactor 等真实时间（服务端按真实经过时间判进度）
				if (i < pts.length - 1) {
					const waitMs = Math.round((pts[i + 1].t - t) * 1000 * opts.paceFactor);
					this.state.active.set(tag, `${t}/${duration}s，等待 ${Math.round(waitMs / 1000)}s`);
					await $.sleep(waitMs);
				}
			}

			log('error', `${tag} 上报完 ${pts.length} 条仍未收到 isPassed —— 未确认完成`);
			log('error', `${tag} 服务端最后响应 HTTP ${lastStatus}：${(lastBody || '(空)').slice(0, 200)}`);
			this.state.fail++;
			return false;
		} finally {
			this.state.active.delete(tag);
		}
	},

	/** 目录：{ kid, name, pending }，pending 是目录上的未完成任务点数 */
	getChapters() {
		const out: { kid: string; name: string; pending: number }[] = [];
		try {
			top?.document
				.querySelectorAll<HTMLElement>('#coursetree .posCatalog_select, .posCatalog_select')
				.forEach((el) => {
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
		} catch (e) {
			log('error', '读取章节目录失败', e);
		}
		const seen = new Set<string>();
		return out.filter((c) => (seen.has(c.kid) ? false : (seen.add(c.kid), true)));
	},

	/** 章节骨架里的卡片序号 */
	async getChapterCards(courseId: string, clazzid: string, chapterId: string, cpi: string) {
		const url =
			`/mooc-ans/mycourse/studentstudyAjax?courseId=${courseId}&clazzid=${clazzid}` +
			`&chapterId=${chapterId}&cpi=${cpi}&verificationcode=&mooc2=1&toComputer=false` +
			`&microTopicId=0&editorPreview=0&isPreviewVideo=false&videoWidth=0&videoHeight=0` +
			`&targetVideoJobId=&cardIndex=0`;
		const r = await httpText(url);
		const doc = new DOMParser().parseFromString(r.text, 'text/html');
		const cards: number[] = [];
		doc.querySelectorAll('#prev_tab .prev_ul li, .prev_ul li').forEach((li, i) => {
			if (li.getAttribute('cardid')) cards.push(i);
		});
		return cards;
	},

	/** 单张卡片的 mArg */
	async getCardMArg(courseId: string, clazzid: string, chapterId: string, num: number, cpi: string) {
		const url =
			`/mooc-ans/knowledge/cards?clazzid=${clazzid}&courseid=${courseId}&knowledgeid=${chapterId}` +
			`&num=${num}&ut=s&cpi=${cpi}&v=2025-0424-1038-4&mooc2=1&isMicroCourse=false&editorPreview=0&crossId=`;
		const r = await httpText(url);
		return extractMArg(r.text);
	},

	/** 遍历章节收集视频任务点 */
	async collectTasks(opts: RequestOptions) {
		const liveDefaults: RequestDefaults = ($gm.unsafeWindow as any)?.mArg?.defaults || {};
		const params = new URLSearchParams((top?.location || location).search);
		const courseId = String(liveDefaults.courseid || params.get('courseId') || '');
		const clazzid = String(liveDefaults.clazzId || params.get('clazzid') || params.get('clazzId') || '');
		const cpi = String(liveDefaults.cpi || params.get('cpi') || '');

		if (!courseId || !clazzid) {
			this.state.note = '拿不到 courseId/clazzid，请停留在课程学习页面后重试';
			log('error', `发包模式：${this.state.note}`);
			return [] as RequestTask[];
		}

		const chapters = this.getChapters();
		const list = chapters.filter((c) => !opts.skipFinished || c.pending > 0);
		log('log', `章节：共 ${chapters.length} 章，待处理 ${list.length} 章`);

		const tasks: RequestTask[] = [];
		for (const [index, ch] of list.entries()) {
			if (this.state.stop) break;
			try {
				const nums = await this.getChapterCards(courseId, clazzid, ch.kid, cpi);
				log('log', `收集：第 ${index + 1}/${list.length} 章 ${ch.name}，${nums.length} 张卡片`);
				for (const num of nums) {
					if (this.state.stop) break;
					const marg = await this.getCardMArg(courseId, clazzid, ch.kid, num, cpi);
					if (!marg?.attachments?.length) continue;

					// 卡片里的 defaults 比首页更全（reportUrl / userid / clazzId 都在这）
					const def: RequestDefaults = { ...liveDefaults, ...(marg.defaults || {}) };
					def.courseid = courseId;
					def.clazzId = clazzid;
					def.cpi = cpi;

					// 有人脸识别的课程直接拒绝：不播放就过不了抓拍，发包只会白跑
					if (this.isFaceRequired(def)) {
						this.state.blocked = true;
						this.state.note = '该课程启用了抓拍/人脸识别，发包模式不适用，请把「视频完成方式」改回「模拟播放」';
						log('error', `发包模式已中止：${ch.name} 启用了抓拍/人脸识别`);
						return [] as RequestTask[];
					}

					for (const att of marg.attachments) {
						if (!att.objectId || this.state.passed.has(att.objectId)) {
							if (att.objectId) this.state.skip++;
							continue;
						}
						const module = att.property?.module;
						if (module && module !== 'insertvideo' && module !== 'insertaudio') continue;
						const jobid = att.jobid || att.property?._jobid || att.property?.jobid || '';
						tasks.push({
							tag: `[${ch.name} ${String(att.objectId).slice(0, 8)}${jobid ? ' jobid=' + jobid : ''}]`,
							defaults: def,
							attachment: att
						});
					}
					await $.sleep(300);
				}
			} catch (e) {
				log('error', `发包模式：章节 ${ch.name} 解析失败，跳过`, e);
			}
			await $.sleep(600);
		}

		this.state.total = tasks.length;
		return tasks;
	},

	/** N 个 worker 抢队列，单个任务内部仍按真实节奏等待 */
	async runPool(tasks: RequestTask[], opts: RequestOptions) {
		await runConcurrentPool(
			tasks,
			opts.concurrency,
			async (task) => {
				this.state.running++;
				try {
					await this.completeVideo(task, opts);
				} catch (e) {
					this.state.fail++;
					log('error', `${task.tag} 上报异常`, e);
				} finally {
					this.state.running--;
				}
			},
			() => this.state.stop
		);
	},

	/** 一行进度，给后台日志面板看 */
	progressLine() {
		const s = this.state;
		const done = s.ok + s.fail;
		const percent = s.total ? Math.round((done / s.total) * 100) : 0;
		const doing = Array.from(s.active.entries())
			.slice(0, 3)
			.map(([tag, action]) => `${tag} ${action}`)
			.join('；');
		return (
			`进度 ✓${s.ok} ✗${s.fail} 跳过 ${s.skip} 进行中 ${s.running} ｜ ${done}/${s.total}（${percent}%）` +
			(doing ? ` ｜ ${doing}` : '')
		);
	},

	/**
	 * 一键发包
	 *
	 * 只在「课程学习」脚本的发包模式下调用；不切页面、全走接口，
	 * 所以停在哪个任务点都行，但请不要手动切章节（脚本跑在当前帧里）。
	 * 反馈全在 OCS 后台日志面板与浏览器控制台，每 30 秒一条进度。
	 */
	async run(opts: RequestOptions) {
		Object.assign(this.state, { total: 0, ok: 0, fail: 0, skip: 0, running: 0, stop: false, blocked: false, note: '' });
		this.state.active.clear();

		log('log', `启动：并发 ${opts.concurrency}，节奏 ${opts.paceFactor}x，${location.href}`);
		const reporter = setInterval(() => !this.state.stop && log('log', this.progressLine()), 30000);

		try {
			await this.loadPassed();
			const tasks = await this.collectTasks(opts);
			if (!tasks.length) {
				log('warn', this.state.note || '没有需要上报的视频任务点');
				return;
			}
			log('log', `队列就绪：${tasks.length} 个视频任务点，并发 ${opts.concurrency}`);
			await this.runPool(tasks, opts);
			log('log', `结束：完成 ${this.state.ok}，未确认 ${this.state.fail}，跳过已完成 ${this.state.skip}`);
			this.state.note =
				this.state.note ||
				(this.state.fail
					? `有 ${this.state.fail} 个视频未收到完成回执，可稍后重跑（已完成的会自动跳过）`
					: '全部上报完成');
		} catch (e) {
			this.state.note = `发包流程异常：${String((e as Error)?.message || e)}`;
			log('error', '发包流程异常', e);
		} finally {
			clearInterval(reporter);
		}
	}
};
