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
		let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;
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
 * Retry a transient AbortError while starting a media element.
 *
 * Chaoxing may replace a video source while the next chapter loads. Firefox
 * then rejects an early play() request even though a later one can succeed.
 * Other errors (notably NotAllowedError) must reach the normal error handler.
 */
export async function playMediaWithAbortRetry(
	media: HTMLMediaElement,
	retryDelays: readonly number[] = [700, 1200, 2000, 3500]
): Promise<void> {
	for (let attempt = 0; ; attempt++) {
		try {
			await media.play();
			return;
		} catch (error) {
			if (
				!(error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') ||
				attempt >= retryDelays.length
			) {
				throw error;
			}

			await new Promise<void>((resolve) => setTimeout(resolve, retryDelays[attempt]));
			// Never restart a removed player or a video that has already finished.
			if (!media.isConnected || media.ended) throw error;
			// Another playback attempt may already have succeeded while waiting.
			if (!media.paused) return;
		}
	}
}

export function waitForElement(
	selector: string | { (): HTMLElement | undefined | null },
	opts?: { timeout_seconds?: number; check_period_ms?: number }
) {
	return waitFor(() => {
		return typeof selector === 'function' ? selector() : document.querySelector<HTMLElement>(selector);
	}, opts);
}

export function waitFor<T>(predicate: () => T, opts?: { timeout_seconds?: number; check_period_ms?: number }) {
	return new Promise<T>((resolve, reject) => {
		let timeout: any;
		const interval = setInterval(() => {
			const result = predicate();
			if (result) {
				clearInterval(interval);
				timeout && clearTimeout(timeout);
				resolve(result);
			}
		}, opts?.check_period_ms || 1000);

		// 超时跳过
		if (opts?.timeout_seconds) {
			timeout = setTimeout(() => {
				clearInterval(interval);
				resolve(undefined as any);
			}, (opts?.timeout_seconds || 10) * 1000);
		}
	});
}
