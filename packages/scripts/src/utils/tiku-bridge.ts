import { AnswerWrapperParser } from '@ocsjs/core';
import type { AnswererWrapper } from '@ocsjs/core';
import { $gm } from 'easy-us';
import {
	CommonProject,
	MAX_ANSWERER_WRAPPERS,
	openAnswererConfigModal,
	saveAnswererWrappers
} from '../projects/common';
import { scanAnswerWrapperRisks } from './answer-wrapper-security';
import { snapToEdgeLocally } from './edge-minimize';

/**
 * 题库页桥接（tiku.zerror.cc、tk.zerrorai.com）
 *
 * 脚本注入该源后把悬浮窗收成右侧图标，并向页面提供 postMessage 接口：
 * - 探测脚本是否在运行
 * - 查询对应题库是否已安装
 * - 题库导入：解析 config 并写入脚本题库配置
 * - 题库被清空时通知页面
 *
 * 页面与油猴脚本隔离，页面只能通过 postMessage 或读取 unsafeWindow.__OCS_TIKU__ 感知脚本。
 * 是否注入由 @match 决定（见 scripts/build-core.js），这里只做二次校验。
 */

const TIKU_BRIDGE_HOSTS = [
	'tiku.zerror.cc',
	'tk.zerrorai.com',
	...(typeof __OCS_MATCH_LOCALHOST__ !== 'undefined' && __OCS_MATCH_LOCALHOST__ ? ['localhost', '127.0.0.1'] : [])
];
const TIKU_BRIDGE_PROTOCOL_VERSION = 1;

/** 页面发出的消息 source */
const TIKU_PAGE_SOURCE = 'ocs-tiku-page';
/** 脚本发出的消息 source */
const TIKU_SCRIPT_SOURCE = 'ocs-tiku-script';

const TIKU_PING_TYPE = 'ocs-tiku-ping';
const TIKU_READY_TYPE = 'ocs-tiku-ready';
const TIKU_IMPORT_TYPE = 'ocs-tiku-import';
const TIKU_IMPORT_RESULT_TYPE = 'ocs-tiku-import-result';
const TIKU_INSTALLED_TYPE = 'ocs-tiku-installed';
const TIKU_INSTALLED_RESULT_TYPE = 'ocs-tiku-installed-result';
const TIKU_CLEARED_TYPE = 'ocs-tiku-cleared';

/** 同步探测标记，挂在页面 window 上 */
const TIKU_PAGE_FLAG = '__OCS_TIKU__';

let mounted = false;

function isTikuBridgePage() {
	return TIKU_BRIDGE_HOSTS.includes(location.hostname);
}

function postToPage(payload: Record<string, unknown>) {
	window.postMessage(
		{
			source: TIKU_SCRIPT_SOURCE,
			version: TIKU_BRIDGE_PROTOCOL_VERSION,
			...payload
		},
		location.origin
	);
}

function installedAnswerers(): AnswererWrapper[] {
	const list = CommonProject.scripts.settings.cfg.answererWrappers;
	return Array.isArray(list) ? list : [];
}

function queryText(value: unknown) {
	return typeof value === 'string' ? value.trim() : '';
}

/** 同一题库的不同配置用 id / token 区分。id 取配置上的 id 或 data.id，token 取 data.token。 */
function configIdentity(item: AnswererWrapper) {
	const data = item.data && typeof item.data === 'object' ? item.data : {};
	return {
		name: item.name || '',
		url: item.url || '',
		homepage: item.homepage || '',
		id: queryText((item as { id?: unknown }).id) || queryText(data.id),
		token: queryText(data.token)
	};
}

/** 按名字、接口、官网、id、token 查询。传了的字段必须全中。都不传时表示「有没有任何题库」。 */
function queryInstalled(query: { name?: unknown; url?: unknown; homepage?: unknown; id?: unknown; token?: unknown }) {
	const name = queryText(query.name);
	const url = queryText(query.url);
	const homepage = queryText(query.homepage);
	const id = queryText(query.id);
	const token = queryText(query.token);
	const filtered = Boolean(name || url || homepage || id || token);
	const list = installedAnswerers();
	const matched = list.filter((item) => {
		const identity = configIdentity(item);
		if (name && identity.name !== name) return false;
		if (url && identity.url !== url) return false;
		if (homepage && identity.homepage !== homepage) return false;
		if (id && identity.id !== id) return false;
		if (token && identity.token !== token) return false;
		return filtered;
	});
	const hit = filtered ? matched : list;
	// token 只用于比对，不回传给页面，避免页面读到用户在其他题库的凭证
	const configs = hit.map((item) => {
		const { token: _token, ...summary } = configIdentity(item);
		return summary;
	});
	return {
		installed: configs.length > 0,
		count: configs.length,
		names: configs.map((item) => item.name).filter(Boolean),
		configs
	};
}

function announceCleared() {
	postToPage({
		type: TIKU_CLEARED_TYPE,
		installed: false,
		count: 0,
		names: [],
		configs: []
	});
}

function announceReady() {
	postToPage({
		type: TIKU_READY_TYPE,
		running: true
	});
}

function normalizeConfigInput(config: unknown): unknown {
	if (
		config &&
		typeof config === 'object' &&
		!Array.isArray(config) &&
		typeof (config as AnswererWrapper).name === 'string' &&
		typeof (config as AnswererWrapper).url === 'string'
	) {
		return [config];
	}
	return config;
}

/** 同一个题库：名字和接口地址都相同。token / id 属于这份配置，变了也覆盖，不另加一条。 */
function sameBank(a: AnswererWrapper, b: AnswererWrapper) {
	return a.name === b.name && a.url === b.url;
}

/** 同一批里同一题库只留最后一条；再按题库覆盖已有列表，其他题库保留，新的追加到末尾 */
function mergeAnswerers(current: AnswererWrapper[], aws: AnswererWrapper[]) {
	const incoming: AnswererWrapper[] = [];
	for (const item of aws) {
		const index = incoming.findIndex((saved) => sameBank(saved, item));
		if (index >= 0) incoming[index] = item;
		else incoming.push(item);
	}

	const merged: AnswererWrapper[] = [];
	for (const saved of current) {
		const replacement = incoming.find((item) => sameBank(item, saved));
		if (!replacement) merged.push(saved);
		else if (!merged.includes(replacement)) merged.push(replacement);
	}
	for (const item of incoming) {
		if (!merged.includes(item)) merged.push(item);
	}
	return { incoming, merged };
}

/**
 * 把页面传来的题库配置合并进已有列表并保存。
 * 不弹手动配置的确认框，风险配置直接拒绝。
 */
function saveImportedConfig(config: unknown): { ok: boolean; status: string; count?: number; message?: string } {
	let aws: AnswererWrapper[];
	try {
		aws = AnswerWrapperParser.from(normalizeConfigInput(config));
	} catch (error) {
		return {
			ok: false,
			status: 'invalid',
			message: error instanceof Error ? error.message : String(error)
		};
	}

	const current = installedAnswerers();
	const { incoming, merged } = mergeAnswerers(current, aws);

	if (merged.length > MAX_ANSWERER_WRAPPERS) {
		return {
			ok: false,
			status: 'too_many',
			count: merged.length,
			message: `题库不能超过 ${MAX_ANSWERER_WRAPPERS} 个`
		};
	}

	const risks = incoming.flatMap((item) =>
		scanAnswerWrapperRisks(item).map((finding) => `${item.name}: ${finding.feature}`)
	);
	if (risks.length) {
		return { ok: false, status: 'rejected', message: risks.join('；') };
	}

	if (JSON.stringify(current) !== JSON.stringify(merged)) {
		saveAnswererWrappers(merged);
	}
	openAnswererConfigModal('official', {
		text: '✅ 题库配置已保存，重新答题或刷新界面 即可生效。',
		type: 'success'
	});
	return { ok: true, status: 'saved', count: merged.length };
}

/**
 * 在题库页挂上桥接。其它网站调用时什么都不做。
 * 在 start() 之后调用，这时悬浮窗已经挂到 shadow root。
 */
export function mountTikuBridge() {
	if (!isTikuBridgePage() || mounted) return;
	mounted = true;

	snapToEdgeLocally();

	const pageWindow = $gm.unsafeWindow as Window & {
		[TIKU_PAGE_FLAG]?: { version: number; running: true; origin: string };
	};
	pageWindow[TIKU_PAGE_FLAG] = {
		version: TIKU_BRIDGE_PROTOCOL_VERSION,
		running: true,
		origin: location.origin
	};

	window.addEventListener('message', (event: MessageEvent) => {
		// 油猴隔离环境下，脚本里的 window 是沙箱，页面 postMessage 的 event.source 是页面 window。
		// 不能用 event.source !== window 过滤，否则页面消息会全部被丢掉。
		if (event.origin !== location.origin) return;
		if (event.source != null && event.source !== window && event.source !== pageWindow) return;
		const data = event.data;
		if (!data || data.source !== TIKU_PAGE_SOURCE || data.version !== TIKU_BRIDGE_PROTOCOL_VERSION) return;

		if (data.type === TIKU_PING_TYPE) {
			announceReady();
			return;
		}

		if (data.type === TIKU_INSTALLED_TYPE) {
			postToPage({
				type: TIKU_INSTALLED_RESULT_TYPE,
				...queryInstalled(data)
			});
			return;
		}

		if (data.type === TIKU_IMPORT_TYPE) {
			postToPage({
				type: TIKU_IMPORT_RESULT_TYPE,
				...saveImportedConfig(data.config)
			});
		}
	});

	CommonProject.scripts.settings.onConfigChange('answererWrappers', (curr, pre) => {
		const next = Array.isArray(curr) ? curr : [];
		const prev = Array.isArray(pre) ? pre : [];
		if (next.length === 0 && prev.length > 0) {
			announceCleared();
		}
	});

	announceReady();
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', announceReady, { once: true });
	}
}
