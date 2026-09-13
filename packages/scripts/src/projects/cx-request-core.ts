/**
 * 超星音视频任务点上报协议：纯逻辑部分（只依赖 md5，便于在 node 里单独回归）
 *
 * 协议还原自播放器 index.js / videojs-ext：
 *   enc = md5("[clazzId][userid][jobid][objectId][毫秒位置][盐][duration*1000][clipTime]")
 * 上报走 GET；响应体是 eval("var d="+body) 那种「键名无引号」的 JS 字面量，JSON.parse 会失败。
 */

import md5 from 'md5';

/** 逆向自播放器的固定盐 */
export const SALT = 'd_yHJ!$pdA~5';

/** 播放器上报的事件标记：play=3 playing=0 pause=2 drag=1 ended=4（这里只用到 3/0/4） */
export const ISDRAG = { PLAY: 3, PLAYING: 0, ENDED: 4 };

/** mArg.defaults：上报协议的全部上下文（卡片 HTML 内嵌） */
export type RequestDefaults = {
	reportUrl?: string;
	fid?: string;
	clazzId?: string;
	userid?: string;
	courseid?: string;
	cpi?: string;
	/** 播放器自身的上报节流，60 秒 */
	reportTimeInterval?: number;
	rt?: number;
	/** 抓拍/人脸识别的四个门控字段，见 isFaceRequired */
	isSupportFace?: number | boolean;
	isShowFaceCollection?: number | boolean;
	chapterCapture?: number | boolean;
	playingCapture?: number | boolean;
};

/** mArg.attachments 里的音视频任务点 */
export type RequestAttachment = {
	objectId?: string;
	jobid?: string;
	attDuration?: number | string;
	attDurationEnc?: string;
	videoFaceCaptureEnc?: string;
	otherInfo?: string;
	rt?: number;
	startTime?: string | number;
	endTime?: string | number;
	property?: { _jobid?: string; jobid?: string; module?: string };
};

export function getCookie(name: string) {
	const m = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
	return m ? decodeURIComponent(m[2]) : '';
}

/**
 * 取卡片 HTML 里的 mArg
 *
 * cards.html 里 mArg 有两处赋值（开头置空 + try 块内真实 JSON），必须取真实那处。
 */
export function extractMArg(html: string): { defaults?: RequestDefaults; attachments?: RequestAttachment[] } | null {
	const re = /mArg\s*=\s*(\{[\s\S]*?\})\s*;\s*\}catch\(/g;
	let m: RegExpExecArray | null;
	let last: string | null = null;
	while ((m = re.exec(html))) last = m[1];
	if (last) {
		try {
			return JSON.parse(last);
		} catch (e) {
			/* 落回下面的逐字符截取 */
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

/** enc 签名用的明文：拼接顺序即协议，不可调整 */
export function buildEncPlain(o: {
	clazzId: string;
	userid: string;
	jobid: string;
	objectId: string;
	/** 毫秒位置 */
	ms: number;
	duration: number;
	clipTime: string;
}) {
	return `[${o.clazzId}][${o.userid}][${o.jobid}][${o.objectId}][${o.ms}][${SALT}][${o.duration * 1000}][${
		o.clipTime
	}]`;
}

/** 拼接上报 URL，字段顺序与真实客户端逐字段一致 */
export function buildReportUrl(o: {
	reportUrl: string;
	dtoken: string;
	clazzId: string;
	userid: string;
	jobid: string;
	objectId: string;
	playingTime: number;
	duration: number;
	clipTime: string;
	otherInfo: string;
	isdrag: number;
	rt: number;
	videoFaceCaptureEnc: string;
	attDuration: number;
	attDurationEnc: string;
	/** 便于回归比对，缺省取当前时间 */
	ts?: number;
}) {
	const enc = md5(
		buildEncPlain({
			clazzId: o.clazzId,
			userid: o.userid,
			jobid: o.jobid,
			objectId: o.objectId,
			ms: o.playingTime * 1000,
			duration: o.duration,
			clipTime: o.clipTime
		})
	);
	return (
		`${o.reportUrl}/${o.dtoken}?clazzId=${o.clazzId}` +
		`&playingTime=${o.playingTime}&duration=${o.duration}&clipTime=${o.clipTime}` +
		`&objectId=${o.objectId}&otherInfo=${o.otherInfo}&jobid=${o.jobid}&userid=${o.userid}` +
		`&isdrag=${o.isdrag}&view=pc&enc=${enc}&rt=${o.rt}` +
		`&videoFaceCaptureEnc=${o.videoFaceCaptureEnc}&dtype=Video&_t=${o.ts ?? Date.now()}` +
		`&attDuration=${o.attDuration}${o.attDurationEnc ? '&attDurationEnc=' + o.attDurationEnc : ''}` +
		`&courseEngineInfo=false`
	);
}

/** 上报点：首发 play，中间按页面的 reportTimeInterval 上 playing，最后 ended */
export function planPoints(duration: number, step: number) {
	const interval = step > 0 ? step : 60;
	const pts: { t: number; isdrag: number }[] = [{ t: 0, isdrag: ISDRAG.PLAY }];
	for (let t = interval; t < duration; t += interval) {
		pts.push({ t, isdrag: ISDRAG.PLAYING });
	}
	pts.push({ t: duration, isdrag: ISDRAG.ENDED });
	return pts;
}

/** 完成判定：响应体是无引号 JS 字面量，只能正则匹配 */
export function isPassedBody(body: string) {
	return /["']?isPassed["']?\s*:\s*(true|1)\b/.test(body);
}

/**
 * 固定 N 个 worker 抢同一个队列
 *
 * 单个任务内部要按真实节奏等待，所以并发数只用来同时推进多个视频。
 */
export async function runConcurrentPool<T>(
	tasks: T[],
	concurrency: number,
	runner: (task: T) => Promise<void>,
	shouldStop?: () => boolean
) {
	let index = 0;
	const size = Math.max(1, Math.min(Math.floor(concurrency) || 1, tasks.length));
	const worker = async () => {
		while (index < tasks.length) {
			if (shouldStop?.()) return;
			await runner(tasks[index++]);
		}
	};
	await Promise.all(Array.from({ length: size }, worker));
}
