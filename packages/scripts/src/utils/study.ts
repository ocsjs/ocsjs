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
 * 等待元素出现。
 *
 * 【超时抛错】设置 `timeout_seconds` 后，超时将 reject 抛出 Error（可用 `timeout_message` 自定义错误信息）；
 * 不传 `timeout_seconds` 则永不超时、永不 reject（无限等待）。
 * resolve 时保证元素存在（非空）。
 *
 * 调用方处理建议：
 * - 元素必须存在才能继续：直接 `await`，异常向上抛由外层统一处理（建议配 `timeout_message` 说明等待目标）
 * - 元素缺失是正常情况（探测式等待）：`await waitForElement(...).catch(() => undefined)` 后判空
 *
 * @param selector 选择器或返回元素的函数
 * @param opts.timeout_seconds 超时时间（秒），不传则永不超时
 * @param opts.check_period_ms 轮询间隔（毫秒），默认 1000
 * @param opts.timeout_message 超时时抛出的错误信息（建议提供，便于定位是哪个等待超时）
 * @throws {Error} 超时（仅当设置了 `timeout_seconds`）：内容为 `timeout_message` 或 `waitFor timeout {N}s`
 * @throws selector 为函数时其内部抛出的异常（轮询中 predicate 报错会立即 reject）
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
 * 异步等待条件成立。
 *
 * 【超时抛错】设置 `timeout_seconds` 后，超时将 reject 抛出 Error（可用 `timeout_message` 自定义错误信息）；
 * 不传 `timeout_seconds` 则永不超时、永不 reject（无限等待）。
 * resolve 仅在 predicate 返回真值时触发。
 *
 * 调用方处理建议：
 * - 条件必须成立才能继续：直接 `await`，异常向上抛由外层统一处理（建议配 `timeout_message`）
 * - 条件不成立是正常情况（探测式等待）：`await waitFor(...).catch(() => undefined)` 后判空
 *
 * @param predicate 轮询函数，返回真值时 resolve 该值
 * @param opts.timeout_seconds 超时时间（秒），不传则永不超时
 * @param opts.check_period_ms 轮询间隔（毫秒），默认 1000
 * @param opts.timeout_message 超时时抛出的错误信息（建议提供，便于定位是哪个等待超时）
 * @throws {Error} 超时（仅当设置了 `timeout_seconds`）：内容为 `timeout_message` 或 `waitFor timeout {N}s`
 * @throws predicate 自身抛出的异常（轮询中 predicate 报错会立即 reject）
 */
export function waitFor<T>(
	predicate: () => Promise<T> | T,
	opts?: { timeout_seconds?: number; check_period_ms?: number; timeout_message?: string }
): Promise<T> {
	const { timeout_seconds, check_period_ms = 1000, timeout_message } = opts ?? {};

	return new Promise<T>((resolve, reject) => {
		let timeoutId: ReturnType<typeof setTimeout> | undefined;
		let isRunning = false;
		let finished = false;

		// setInterval 回调与 poll 内的 await 均为异步执行，此处 cleanup 必定已完成初始化
		const intervalId = setInterval(poll, check_period_ms);

		const cleanup = () => {
			finished = true;
			clearInterval(intervalId);
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

		poll();

		if (timeout_seconds != null) {
			timeoutId = setTimeout(() => {
				cleanup();
				reject(new Error(timeout_message ?? `waitFor timeout ${timeout_seconds}s`));
			}, timeout_seconds * 1000);
		}
	});
}
