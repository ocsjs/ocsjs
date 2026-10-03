/** 展开 AI 学伴目录，等待异步渲染的小节出现，避免重复点击将目录收起。 */
export async function expandAiChapterDirectory(
	root: Document | HTMLElement = document,
	options: { timeoutMs?: number; settleMs?: number; intervalMs?: number } = {}
): Promise<boolean> {
	const { timeoutMs = 10000, settleMs = 1000, intervalMs = 100 } = options;
	const deadline = Date.now() + timeoutMs;
	const clicked = new WeakSet<HTMLElement>();
	let previousState = '';
	let stableSince = Date.now();

	while (Date.now() < deadline) {
		const icons = Array.from(root.querySelectorAll<HTMLElement>('.expand-icon'));
		const isExpanded = (icon: HTMLElement) =>
			!!icon.closest('.nav-item-title')?.classList.contains('is-expand') || icon.classList.contains('is-expanded');
		let didClick = false;
		for (const icon of icons) {
			if (icon.isConnected && !isExpanded(icon) && !clicked.has(icon)) {
				clicked.add(icon);
				icon.click();
				didClick = true;
			}
		}

		const leafCount = root.querySelectorAll('div.leaf-item').length;
		const state = JSON.stringify([icons.map(isExpanded), leafCount]);
		if (didClick || state !== previousState) {
			previousState = state;
			stableSince = Date.now();
		} else if (leafCount > 0 && icons.every(isExpanded) && Date.now() - stableSince >= settleMs) {
			return true;
		}
		await new Promise<void>((resolve) => setTimeout(resolve, intervalMs));
	}

	return false;
}
