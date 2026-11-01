/**
 * 拟人化操作工具：随机延迟、倍速抖动、随机暂停、模拟鼠标活动。
 *
 * 目的：让脚本行为在时间分布上更接近真人，降低被行为检测命中的概率。
 * 所有函数不依赖页面外的库，可在任意 iframe 上下文中使用。
 */

/** 在 [minMs, maxMs] 区间内随机 sleep */
export function humanSleep(minMs: number, maxMs: number): Promise<void> {
	const ms = Math.round(minMs + Math.random() * Math.max(0, maxMs - minMs));
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 数值抖动：value ± pct 比例，结果夹在 [min, max] 内（提供时） */
export function jitter(value: number, pct: number, min?: number, max?: number): number {
	const delta = value * pct * (Math.random() * 2 - 1);
	let v = value + delta;
	if (min !== undefined) v = Math.max(min, v);
	if (max !== undefined) v = Math.min(max, v);
	return v;
}

/** 在文档上派发一次随机位置的鼠标移动/移入事件 */
export function randomMouseActivity(doc: Document, target?: Element): void {
	try {
		const win = doc.defaultView;
		if (!win) return;
		const x = Math.round(Math.random() * (win.innerWidth || 800));
		const y = Math.round(Math.random() * (win.innerHeight || 600));
		const el = target ?? doc.body;
		if (!el) return;
		for (const type of ['mousemove', 'mouseover']) {
			el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, view: win }));
		}
	} catch (e) {
		/* 跨域等情况忽略 */
	}
}

/** 随机小幅滚动页面（±200px 内） */
export function randomScroll(win: Window): void {
	try {
		const delta = Math.round((Math.random() - 0.5) * 400);
		win.scrollBy({ top: delta, behavior: 'smooth' });
	} catch (e) {
		/* ignore */
	}
}

export interface PlaybackHumanizerOptions {
	/** 基准倍速 */
	baseRate: number;
	/** 倍速抖动幅度（比例），默认 0.15 */
	rateJitter?: number;
	/** 每次随机暂停的时长区间（秒），默认 [3, 12] */
	pauseSeconds?: [number, number];
	/** 两次拟人动作之间的间隔区间（秒），默认 [45, 150] */
	intervalSeconds?: [number, number];
	/** 是否允许随机暂停（有的课程暂停风控严格时可关闭） */
	allowPause?: boolean;
	/** 暂停前回调（返回 false 可取消本次暂停，用于与页面自动续播协调） */
	onBeforePause?: () => boolean;
	/** 恢复播放后回调 */
	onAfterResume?: () => void;
}

/**
 * 播放拟人化：
 * - 每隔一段时间随机微调倍速（基准值附近抖动）
 * - 偶尔暂停几秒再继续（模拟人喝水/看消息）
 * - 伴随随机鼠标活动
 *
 * 返回停止函数（视频结束时务必调用）。
 */
export function startPlaybackHumanizer(
	media: HTMLMediaElement,
	doc: Document,
	opts: PlaybackHumanizerOptions
): () => void {
	const rateJitter = opts.rateJitter ?? 0.15;
	const [pMin, pMax] = opts.pauseSeconds ?? [3, 12];
	const [iMin, iMax] = opts.intervalSeconds ?? [45, 150];
	const allowPause = opts.allowPause ?? true;
	let stopped = false;
	let timer: ReturnType<typeof setTimeout> | undefined;

	const act = async () => {
		if (stopped || media.ended) return;

		randomMouseActivity(doc, media);

		// 倍速抖动：不要每次动作都改，避免倍速跳变过于规律
		if (Math.random() < 0.6) {
			const rate = jitter(opts.baseRate, rateJitter, Math.max(0.5, opts.baseRate - 0.5), opts.baseRate + 0.5);
			try {
				media.playbackRate = Math.round(rate * 100) / 100;
			} catch (e) {
				/* ignore */
			}
		}

		// 随机短暂暂停后恢复
		if (allowPause && Math.random() < 0.35 && !media.paused && (opts.onBeforePause?.() ?? true)) {
			const pauseMs = Math.round((pMin + Math.random() * (pMax - pMin)) * 1000);
			try {
				media.pause();
				await new Promise((resolve) => setTimeout(resolve, pauseMs));
				if (!stopped && !media.ended) {
					await media.play().catch(() => undefined);
					opts.onAfterResume?.();
				}
			} catch (e) {
				/* ignore */
			}
		}
	};

	const loop = () => {
		if (stopped) return;
		const next = (iMin + Math.random() * (iMax - iMin)) * 1000;
		timer = setTimeout(async () => {
			await act();
			loop();
		}, next);
	};
	loop();

	return () => {
		stopped = true;
		if (timer !== undefined) clearTimeout(timer);
	};
}

/** 拟人点击：先随机停顿，再触发鼠标事件序列后 click() */
export async function humanClick(el: HTMLElement | undefined | null): Promise<void> {
	if (!el) return;
	await humanSleep(150, 700);
	try {
		const doc = el.ownerDocument;
		const rect = el.getBoundingClientRect();
		const x = rect.left + rect.width * (0.3 + Math.random() * 0.4);
		const y = rect.top + rect.height * (0.3 + Math.random() * 0.4);
		for (const type of ['mouseover', 'mousemove', 'mousedown', 'mouseup']) {
			el.dispatchEvent(
				new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, view: doc.defaultView })
			);
		}
	} catch (e) {
		/* ignore */
	}
	el.click();
}
