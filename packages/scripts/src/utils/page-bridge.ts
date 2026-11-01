/**
 * MAIN 世界桥接（MV3 兼容层）
 *
 * 背景：Tampermonkey 5.3+ 在 Chromium 138+ 上改用 userScripts API 注入用户脚本。
 * 该模式下 @grant GM_* 与 @grant unsafeWindow 组合会被拒绝注入（无法选世界），
 * 因此脚本必须去掉 unsafeWindow 授权、运行在 USER_SCRIPT（隔离）世界。
 * 隔离世界与页面共享 DOM，但无法访问页面 JS 全局（videojs/Ext/getTeacherAjax/attachments 等）。
 *
 * 本桥通过两种机制补回页面全局访问：
 * 1. pageInvoke(src, args)：向 MAIN 世界注入一次 <script> 引导，之后通过 CustomEvent 往返
 *    执行任意页面世界代码（支持 Promise 返回值），用于函数调用与全局读取。
 * 2. unsafeWindow 代理兼容层：globalThis.unsafeWindow 被替换为 Proxy——
 *    数据类属性（attachments/mArg）从 MAIN 世界镜像（写入 DOM dataset，隔离世界可同步读取）；
 *    函数类属性触发 fire-and-forget 异步调用；document 直接返回本地 document（同一 DOM）。
 *    存量 `$gm.unsafeWindow.xxx` 代码无需逐点改造。
 */

const BRIDGE_REQ = 'ocs-main-req';
const BRIDGE_RES = 'ocs-main-res';
const MIRROR_ATTR = 'data-ocs-mirror';

let installed = false;
let seq = 0;
const pendingCalls = new Map<number, { resolve: (v: any) => void; reject: (e: any) => void; timer: any }>();

/** 需要镜像到 dataset 的页面全局变量名 */
const mirrorNames = new Set<string>(['attachments', 'mArg']);

const MIRROR_INTERVAL_MS = 600;

/**
 * MAIN 世界引导代码。
 * - 监听 BRIDGE_REQ，在页面世界执行 src（函数体），把返回值经 BRIDGE_RES 送回；
 * - 周期性把 mirrorNames 中的全局变量 JSON 序列化写入 documentElement dataset（同步镜像通道）。
 */
const BOOTSTRAP_CODE = `(function(){
	if (window.__ocsMainBridge) return;
	window.__ocsMainBridge = true;
	var REQ = '${BRIDGE_REQ}', RES = '${BRIDGE_RES}', ATTR = '${MIRROR_ATTR}';
	var names = JSON.parse(document.currentScript.getAttribute('data-names') || '[]');
	var mirrorTimer = null;
	function mirror() {
		try {
			var out = {};
			for (var i = 0; i < names.length; i++) {
				var n = names[i];
				try {
					var v = window[n];
					if (v === undefined) continue;
					out[n] = JSON.parse(JSON.stringify(v));
				} catch (e) { /* 序列化失败的单个变量跳过 */ }
			}
			document.documentElement.setAttribute(ATTR, JSON.stringify(out));
		} catch (e) { /* ignore */ }
	}
	function scheduleMirror() {
		if (mirrorTimer) return;
		mirrorTimer = setInterval(mirror, ${MIRROR_INTERVAL_MS});
		mirror();
	}
	document.addEventListener(REQ, function (ev) {
		var d = ev.detail || {};
		try {
			var fn = new Function('return (' + d.src + ')')();
			Promise.resolve().then(function () { return fn.apply(null, d.args || []); }).then(
				function (v) {
					var payload;
					try { payload = JSON.parse(JSON.stringify(v === undefined ? null : v)); }
					catch (e) { payload = null; }
					window.dispatchEvent(new CustomEvent(RES, { detail: { id: d.id, ok: true, value: payload } }));
				},
				function (e) {
					window.dispatchEvent(new CustomEvent(RES, { detail: { id: d.id, ok: false, err: String(e) } }));
				}
			);
		} catch (e) {
			window.dispatchEvent(new CustomEvent(RES, { detail: { id: d.id, ok: false, err: String(e) } }));
		}
	});
	window.dispatchEvent(new CustomEvent(RES, { detail: { id: -1, ok: true, value: 'boot' } }));
	if (names.length) scheduleMirror();
})();`;

/**
 * 安装 MAIN 世界桥。幂等；首次调用时注入引导脚本并监听响应。
 * 必须在任何 pageInvoke/readMirror 之前调用（getUnsafeWindowProxy 会自动调用）。
 */
export function installMainBridge(): void {
	if (installed) return;
	installed = true;
	try {
		window.addEventListener(BRIDGE_RES, (ev: any) => {
			const d = ev.detail || {};
			if (d.id === -1) return; // boot 信号
			const p = pendingCalls.get(d.id);
			if (!p) return;
			pendingCalls.delete(d.id);
			clearTimeout(p.timer);
			if (d.ok) p.resolve(d.value);
			else p.reject(new Error(String(d.err || 'MAIN 世界执行失败')));
		});
	} catch (e) {
		/* 忽略 */
	}
	try {
		const s = document.createElement('script');
		s.textContent = BOOTSTRAP_CODE;
		s.setAttribute('data-names', JSON.stringify(Array.from(mirrorNames)));
		(document.head || document.documentElement).append(s);
		s.remove();
	} catch (e) {
		console.warn('[ocs-bridge] MAIN 世界引导注入失败', e);
	}
}

/**
 * 在页面（MAIN）世界执行一段函数源码。
 * @param src 函数表达式源码，如 `(a, b) => a + b` 或 `function(){ return window.attachments }`
 * @param args 参数（需可 JSON 序列化）
 * @param timeoutMs 超时，默认 15 秒
 */
export function pageInvoke<T = any>(src: string, args: any[] = [], timeoutMs = 15000): Promise<T> {
	installMainBridge();
	return new Promise<T>((resolve, reject) => {
		const id = ++seq;
		const timer = setTimeout(() => {
			pendingCalls.delete(id);
			reject(new Error('pageInvoke 超时: ' + src.slice(0, 60)));
		}, timeoutMs);
		pendingCalls.set(id, { resolve, reject, timer });
		try {
			document.dispatchEvent(new CustomEvent(BRIDGE_REQ, { detail: { id, src, args } }));
		} catch (e) {
			clearTimeout(timer);
			pendingCalls.delete(id);
			reject(e);
		}
	});
}

/** 同步读取 MAIN 世界镜像的全局变量（未镜像/未就绪返回 undefined） */
export function readMirror<T = any>(name: string): T | undefined {
	try {
		const raw = document.documentElement.getAttribute(MIRROR_ATTR);
		if (!raw) return undefined;
		const data = JSON.parse(raw);
		return data[name] as T;
	} catch (e) {
		return undefined;
	}
}

/** 便捷读取：页面全局 JSON 兼容值（优先镜像，回退异步） */
export async function pageGlobal<T = any>(name: string): Promise<T | undefined> {
	const mirrored = readMirror<T>(name);
	if (mirrored !== undefined) return mirrored;
	try {
		return await pageInvoke<T>(
			'(n) => { var v = window[n]; try { return JSON.parse(JSON.stringify(v === undefined ? null : v)); } catch (e) { return null; } }',
			[name]
		);
	} catch (e) {
		return undefined;
	}
}

/** fire-and-forget：在页面世界执行但不等待结果（用于存量同步调用点） */
function invokeFireAndForget(src: string, args: any[]): void {
	pageInvoke(src, args).catch(() => undefined);
}

/**
 * 生成 unsafeWindow 兼容代理（MV3 USER_SCRIPT 世界使用）。
 * - document / location / body 等直接返回本地引用（DOM 同源共享）；
 * - 已镜像的数据属性同步返回镜像值；
 * - 其余属性：可序列化数据走异步缓存首次值，函数属性返回 fire-and-forget 包装；
 * - 赋值操作转发到页面世界（函数值以源码形式传递）。
 */
export function getUnsafeWindowProxy(): Window {
	installMainBridge();
	// document 上与 window 同名但语义不同的属性（document.open/close/write）不能直接透传
	const docSafeProps = new Set(['body', 'head', 'documentElement', 'location', 'title', 'documentURI']);
	return new Proxy({} as Window, {
		get(_t, prop) {
			if (typeof prop !== 'string') return undefined;
			if (prop === 'document') return document;
			if (docSafeProps.has(prop)) return Reflect.get(document, prop as any);
			// 数据镜像同步读取
			const mirrored = readMirror(prop);
			if (mirrored !== undefined) return mirrored;
			// 其余按函数处理：fire-and-forget 调用页面世界同名全局
			return (...args: any[]) => {
				const src = `function(${args.map((_, i) => 'a' + i).join(',')}){ return window[${JSON.stringify(
					prop
				)}].apply(null, arguments); }`;
				invokeFireAndForget(src, args);
			};
		},
		set(_t, prop, value: any) {
			if (typeof prop !== 'string') return true;
			if (typeof value === 'function') {
				const fnSrc = value.toString();
				pageInvoke(
					`(fnSrc){ try { window[${JSON.stringify(
						prop
					)}] = eval('(' + fnSrc + ')'); return true; } catch(e){ return false; } }`,
					[fnSrc]
				).catch(() => undefined);
				return true;
			}
			invokeFireAndForget(`(v){ try { window[${JSON.stringify(prop)}] = v; } catch(e) {} }`, [value]);
			return true;
		},
		has(_t, prop: string) {
			if (prop === 'document') return true;
			return readMirror(prop) !== undefined;
		}
	});
}
