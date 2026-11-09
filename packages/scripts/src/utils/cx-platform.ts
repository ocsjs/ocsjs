/**
 * 超星系平台（超星学习通 / 学银在线 …）的域名与路径差异适配。
 *
 * 背景：
 * - 超星学习通：核心页面挂在根路径下，如 `/mycourse/studentstudy`、`/knowledge/cards`、
 *   `/mooc2/work/dowork`、`/mooc2/exam/preview`。
 * - 学银在线（xueyinonline.com）：后台仍是同一套超星逻辑，但统一挂在 `mooc-ans` 前缀下，
 *   如 `/mooc-ans/mycourse/studentstudy`、`/mooc-ans/knowledge/cards`、
 *   `/mooc-ans/mooc2/work/dowork`、`/mooc-ans/mooc2/exam/preview`。
 *   站点模板里也直接声明了 `_CP_ = "/mooc-ans"`、`_HOST_CP1_ = "//mooc1.xueyinonline.com/mooc-ans"`。
 *
 * 因此脚本匹配不能只写死根路径，否则学银在线页面只会命中「通用」脚本，无法刷课。
 * 本模块把「路径前缀」抽出来，供 cx.ts 生成匹配规则与导航地址使用。
 */

/** 超星新版路径前缀（学银在线使用） */
export const MOOC_ANS_PREFIX = '/mooc-ans';

/**
 * 当前页面是否带 `mooc-ans` 路径前缀（学银在线 / 部分超星站点）。
 * 路径前缀是唯一需要区分的东西：脚本逻辑、展示名称与学习通完全一致。
 */
export function isMoocAnsPath(url: string = location.href): boolean {
	return url.includes(MOOC_ANS_PREFIX + '/');
}

/**
 * 生成一个「两种前缀都匹配」的正则，用于 Script.matches。
 *
 * 例：`cxPath('/mycourse/studentstudy')`
 *   → `/(?:\/mooc-ans)?\/mycourse\/studentstudy/`
 *
 * 注意：只对超星学习通原本为根路径的匹配项使用，
 * 已经是 `/mooc2/...` 的路径同样适用（学银为 `/mooc-ans/mooc2/...`）。
 */
export function cxPath(path: string): RegExp {
	return new RegExp(`(?:${escape(MOOC_ANS_PREFIX)})?${escape(path)}`);
}

function escape(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 把根路径补上当前平台的路径前缀，用于 location 跳转（如 versionRedirect）。
 * 学银在线下 `/mycourse/studentstudy` → `/mooc-ans/mycourse/studentstudy`。
 */
export function withCxPrefix(path: string, url: string = location.href): string {
	if (isMoocAnsPath(url) && !path.startsWith(MOOC_ANS_PREFIX)) {
		return MOOC_ANS_PREFIX + (path.startsWith('/') ? path : '/' + path);
	}
	return path;
}

/**
 * 是否为节点阅读页（nodedetail）。
 *
 * - 学习通：`/ztnodedetailcontroller/visitnodedetail`
 * - 学银在线：`/nodedetailcontroller/visitnodedetail`（无 zt 前缀）
 */
export function isCxNodeDetailPage(url: string = location.href): boolean {
	return /\/[^/]*nodedetailcontroller\/visitnodedetail/.test(url);
}
