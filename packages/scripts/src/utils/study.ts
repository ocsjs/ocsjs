/**
 * 等待视频加载并获取视频
 */
export async function waitForMedia(options?: {
	/**
	 * 视频选择器
	 */
	videoSelector?: string;
	/**
	 * 音频选择器
	 */
	audioSelector?: string;
	/**
	 * 根元素
	 */
	root?: HTMLElement | Document;
	timeout?: number;
	filter?: (video: HTMLVideoElement | HTMLAudioElement) => boolean;
}) {
	const timeoutMs = options?.timeout ?? 3 * 60 * 1000;

	const res = await new Promise<HTMLVideoElement | HTMLAudioElement>((resolve, reject) => {
		// eslint-disable-next-line prefer-const
		let timeoutId: ReturnType<typeof setTimeout> | undefined;
		const interval = setInterval(() => {
			const video = (options?.root || document).querySelector<HTMLVideoElement | HTMLAudioElement>(
				`${options?.videoSelector || 'video'},${options?.audioSelector || 'audio'}`
			);
			if (video && (!options?.filter || options.filter(video))) {
				clearInterval(interval);
				if (timeoutId !== undefined) {
					clearTimeout(timeoutId);
				}
				resolve(video);
			}
		}, 200);

		timeoutId = setTimeout(() => {
			clearInterval(interval);
			reject(new Error('视频/音频未找到，或者加载超时。'));
		}, timeoutMs);
	});

	return res;
}

/**
 * 等待元素出现；设置 timeout_seconds 后超时抛出异常（可用 timeout_message 自定义错误信息）
 */
export function waitForElement(
	selector: string | { (): HTMLElement | undefined | null },
	opts?: { timeout_seconds?: number; check_period_ms?: number; timeout_message?: string }
) {
	return waitFor(() => {
		return typeof selector === 'function' ? selector() : document.querySelector<HTMLElement>(selector);
	}, opts);
}

/**
 * 异步等待，超时抛出异常
 * @param predicate 轮询函数，返回真值时 resolve 该值
 * @param opts.timeout_seconds 超时时间（秒），不传则永不超时
 * @param opts.check_period_ms 轮询间隔（毫秒），默认 1000
 * @param opts.timeout_message 超时时抛出的错误信息（建议提供，便于定位是哪个等待超时）
 */
export function waitFor<T>(
	predicate: () => Promise<T> | T,
	opts?: { timeout_seconds?: number; check_period_ms?: number; timeout_message?: string }
): Promise<T> {
	const { timeout_seconds, check_period_ms = 1000, timeout_message } = opts ?? {};

	return new Promise<T>((resolve, reject) => {
		let intervalId: ReturnType<typeof setInterval> | undefined;
		let timeoutId: ReturnType<typeof setTimeout> | undefined;
		let isRunning = false;
		let finished = false;

		const cleanup = () => {
			finished = true;
			if (intervalId) clearInterval(intervalId);
			if (timeoutId) clearTimeout(timeoutId);
		};

		async function poll() {
			if (isRunning || finished) return;
			isRunning = true;
			try {
				const result = await predicate();
				if (finished) return;
				if (result) {
					cleanup();
					resolve(result);
				}
			} catch (err) {
				cleanup();
				reject(err);
				return;
			} finally {
				isRunning = false;
			}
		}

		intervalId = setInterval(poll, check_period_ms);
		poll();

		if (timeout_seconds != null) {
			timeoutId = setTimeout(() => {
				cleanup();
				reject(new Error(timeout_message ?? `waitFor timeout ${timeout_seconds}s`));
			}, timeout_seconds * 1000);
		}
	});
}
