const guards = new WeakMap<Window, () => void>();

function isStudyPage(pathname: string) {
	return (
		/\/mycourse\/studentstudy(?:[/.]|$)/.test(pathname) ||
		/\/knowledge\/cards(?:[/.]|$)/.test(pathname) ||
		/\/ananas\/modules\/video\//.test(pathname)
	);
}

/**
 * 在超星环境脚本的 onstart 中安装，只拦截移出当前学习文档的 mouseout。
 * 不改写页面原型或删除已有监听器；关闭配置或离开学习路由后放行事件。
 * 无法阻止先于本监听器注册的 window 捕获监听器，也不处理 blur / visibilitychange。
 */
export function installChaoxingMouseoutGuard(pageWindow: Window, isEnabled: () => boolean): () => void {
	guards.get(pageWindow)?.();
	if (!isStudyPage(pageWindow.location.pathname)) return () => {};

	const onMouseout = (event: MouseEvent) => {
		if (event.relatedTarget === null && isEnabled() && isStudyPage(pageWindow.location.pathname)) {
			event.stopImmediatePropagation();
		}
	};
	pageWindow.addEventListener('mouseout', onMouseout, true);

	const cleanup = () => {
		pageWindow.removeEventListener('mouseout', onMouseout, true);
		if (guards.get(pageWindow) === cleanup) guards.delete(pageWindow);
	};
	guards.set(pageWindow, cleanup);
	return cleanup;
}
