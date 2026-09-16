/**
 * 同一文档只允许创建一个 OCS 悬浮窗。
 *
 * easy-us 内部的 `mounted` 是模块级变量，当脚本被重复注入（桌面端重复加载、脚本管理器多次运行、
 * 同时启用多个同族脚本）时会产生多份互不可见的模块实例，于是页面上出现多个完全相同的悬浮窗。
 *
 * 这里把挂载标记放到 `documentElement` 上，使标记能在同一个文档的所有脚本实例之间共享：
 * 不同脚本沙箱的 `window` 互相不可见，但它们操作的是同一棵 DOM。
 *
 * 本模块刻意不直接依赖 easy-us，避免在浏览器全局对象就绪前被加载，
 * 是否需要创建悬浮窗由调用方通过 `shouldMount` 传入判断方式。
 */
import type { StartConfig } from 'easy-us/lib/utils/start';

/** 悬浮窗挂载标记属性名 */
export const OCS_WINDOW_MOUNTED_ATTRIBUTE = 'data-ocs-window-mounted';

/** 默认等待 documentElement 出现的时间，超时后放行以避免误伤正常加载 */
export const WINDOW_MOUNT_WAIT_TIMEOUT = 3000;

/** 去重行为配置 */
export interface GuardOptions {
	/** 等待 documentElement 出现的时间（毫秒） */
	waitTimeout?: number;
}

/**
 * 判断并占用当前文档的「悬浮窗挂载名额」。
 *
 * 读取与写入在同一个同步代码块内完成，因此多个实例不会同时认为自己抢到了名额。
 *
 * @param root 标记承载元素
 * @returns `true` 表示当前实例获得挂载资格，`false` 表示已有实例创建过悬浮窗
 */
export function acquireWindowMount(root: Element): boolean {
	if (root.hasAttribute(OCS_WINDOW_MOUNTED_ATTRIBUTE)) {
		return false;
	}
	root.setAttribute(OCS_WINDOW_MOUNTED_ATTRIBUTE, '');
	return true;
}

/** 释放「悬浮窗挂载名额」 */
export function releaseWindowMount(root: Element): void {
	root.removeAttribute(OCS_WINDOW_MOUNTED_ATTRIBUTE);
}

/** 判断当前文档是否已经创建过悬浮窗 */
export function isWindowMounted(root: Element): boolean {
	return root.hasAttribute(OCS_WINDOW_MOUNTED_ATTRIBUTE);
}

/**
 * 等待 documentElement 出现。
 *
 * 脚本通常以 document-start 注入，此时 documentElement 可能尚未创建，
 * 直接放行会导致重复注入时仍然出现多个悬浮窗，因此这里短暂等待一下。
 */
export function waitForDocumentElement(timeout = WINDOW_MOUNT_WAIT_TIMEOUT): Promise<Element | null> {
	if (typeof document === 'undefined') {
		return Promise.resolve(null);
	}
	if (document.documentElement) {
		return Promise.resolve(document.documentElement);
	}
	return new Promise((resolve) => {
		const finish = () => {
			observer.disconnect();
			clearTimeout(timer);
			resolve(document.documentElement ?? null);
		};
		const observer = new MutationObserver(() => {
			if (document.documentElement) finish();
		});
		const timer = setTimeout(finish, timeout);
		observer.observe(document, { childList: true, subtree: true });
	});
}

/**
 * 包装 easy-us 的 start 函数，为悬浮窗创建加上跨实例防护。
 *
 * - 已经创建过悬浮窗时，后续脚本实例直接跳过并输出警告，避免重复的悬浮窗以及重复的答题、请求；
 * - 只在「当前是顶层窗口且存在匹配脚本」时才占用名额，其余情况保持原有行为；
 * - 启动过程抛错时释放名额，避免后续实例被永久挡住；
 * - 挂载标记按文档区分，iframe 中的脚本互不影响；
 * - documentElement 始终未出现时按原行为放行，不做拦截。
 *
 * @param startFn easy-us 的 start 函数
 * @param shouldMount 判断当前实例是否会创建悬浮窗（顶层窗口 + 存在匹配脚本）
 * @param options 去重行为配置
 */
export function createGuardedStart(
	startFn: (config: StartConfig) => Promise<void>,
	shouldMount: (config: StartConfig) => boolean,
	options: GuardOptions = {}
) {
	const guardedRun = async (root: Element, config: StartConfig): Promise<void> => {
		if (!acquireWindowMount(root)) {
			console.warn('OCS: another script instance already created a window, skipping.');
			return;
		}

		try {
			await startFn(config);
		} catch (error) {
			releaseWindowMount(root);
			throw error;
		}
	};

	return async function guardedStart(config: StartConfig): Promise<void> {
		// 不创建悬浮窗的情景不参与去重，保持原有行为
		if (!config?.renderConfig || typeof document === 'undefined' || !shouldMount(config)) {
			return startFn(config);
		}

		// 常见情况下 documentElement 已就绪，走同步路径，不改变原有调用时机
		const immediateRoot = document.documentElement;
		if (immediateRoot) {
			return guardedRun(immediateRoot, config);
		}

		const root = await waitForDocumentElement(options.waitTimeout);
		if (!root) {
			return startFn(config);
		}
		return guardedRun(root, config);
	};
}
