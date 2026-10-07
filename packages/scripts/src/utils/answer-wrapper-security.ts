import { $modal, h } from 'easy-us';
import type { AnswererWrapper } from '@ocsjs/core';

/** 风险命中项 */
export interface HandlerRiskFinding {
	/** 命中的位置（handler 解析器 / data.xxx 字段解析器） */
	where: string;
	/** 命中的代码特征 */
	feature: string;
	/** 风险说明 */
	reason: string;
}

interface DangerousPattern {
	pattern: RegExp;
	feature: string;
	reason: string;
}

/**
 * 危险代码特征表
 *
 * 题库配置的 handler 在答题时以用户登录身份执行，正常 handler 只需读取响应 JSON 并返回 [题目, 答案]，
 * 无需网络、存储、DOM 等能力，命中以下特征即视为可疑（启发式语法检测，仅用于风险提示，不阻断执行）
 */
const DANGEROUS_PATTERNS: DangerousPattern[] = [
	{ pattern: /\beval\b/, feature: 'eval', reason: '动态执行任意代码' },
	{ pattern: /\bFunction\s*\(/, feature: 'Function()', reason: '动态执行任意代码' },
	{ pattern: /\bfetch\s*\(/, feature: 'fetch', reason: '发起网络请求，可能向外部发送账号数据' },
	{ pattern: /\bXMLHttpRequest\b/, feature: 'XMLHttpRequest', reason: '发起网络请求，可能向外部发送账号数据' },
	{
		pattern: /\bGM_xmlhttpRequest\b|\bGM\s*\.\s*xmlHttpRequest\b/,
		feature: 'GM_xmlhttpRequest',
		reason: '使用脚本管理器权限发起跨域请求，可能向外部发送账号数据'
	},
	{
		pattern: /\bGM_\w+|\bGM\s*\.\s*\w+/,
		feature: 'GM API',
		reason: '调用脚本管理器扩展 API（可能读写剪贴板、跨域请求等）'
	},
	{
		pattern: /\blocalStorage\b|\bsessionStorage\b|\bindexedDB\b/,
		feature: '本地存储',
		reason: '读写浏览器存储，可能窃取登录凭据'
	},
	{ pattern: /\bcookie\b/i, feature: 'cookie', reason: '读取 Cookie，可能窃取登录状态' },
	{ pattern: /\bsendBeacon\b/, feature: 'sendBeacon', reason: '静默向外部服务器发送数据' },
	{ pattern: /\bWebSocket\b|\bEventSource\b/, feature: 'WebSocket/EventSource', reason: '建立长连接，可持续外传数据' },
	{ pattern: /\blocation\b/, feature: 'location', reason: '读取或篡改页面地址，可能跳转至钓鱼页面' },
	{
		pattern: /\bwindow\b|\bglobalThis\b|\bunsafeWindow\b|\btop\b|\bparent\b|\bopener\b/,
		feature: '全局对象',
		reason: '访问全局环境，可操控页面与浏览器行为'
	},
	{ pattern: /\bdocument\b/, feature: 'document', reason: '操作网页内容，可能篡改页面或窃取输入' },
	{ pattern: /\bpostMessage\b/, feature: 'postMessage', reason: '向其他窗口发送数据' },
	{ pattern: /\bimport\s*\(/, feature: 'import()', reason: '动态加载并执行外部脚本' },
	{ pattern: /\brequire\s*\(/, feature: 'require()', reason: '加载外部模块' },
	{ pattern: /\.constructor\b|\b__proto__\b/, feature: '原型链访问', reason: '操作原型链，常用于绕过安全检测' },
	{
		pattern: /\bfromCharCode\b|\batob\b|\bunescape\b/,
		feature: '解码函数',
		reason: '解码隐藏内容，常用于混淆恶意代码'
	},
	{ pattern: /\bWorker\b/, feature: 'Worker', reason: '创建后台线程执行代码' },
	{
		pattern: /\[\s*['"`][^\]'"]*['"`]\s*\+|\+\s*['"`][^\]'"]*['"`]\s*\]/,
		feature: '拼接属性访问',
		reason: '通过字符串拼接隐藏真实调用的功能，常见于混淆代码'
	}
];

/**
 * 移除代码中的注释与字符串字面量（避免误报字符串内的关键词），
 * 同时收集字符串中的混淆特征（转义字符、超长编码串、模板字符串内嵌表达式保留检测）
 */
function stripCommentsAndStrings(code: string): { stripped: string; findings: HandlerRiskFinding[] } {
	const findings: HandlerRiskFinding[] = [];
	let stripped = '';
	let i = 0;

	while (i < code.length) {
		const ch = code[i];
		const next = code[i + 1];

		// 行注释
		if (ch === '/' && next === '/') {
			while (i < code.length && code[i] !== '\n') i++;
			continue;
		}
		// 块注释
		if (ch === '/' && next === '*') {
			i += 2;
			while (i < code.length && !(code[i] === '*' && code[i + 1] === '/')) i++;
			i += 2;
			continue;
		}
		// 字符串字面量（含模板字符串）
		if (ch === "'" || ch === '"' || ch === '`') {
			const quote = ch;
			let str = '';
			i++;
			while (i < code.length && code[i] !== quote) {
				if (code[i] === '\\') {
					str += code[i] + (code[i + 1] || '');
					i += 2;
					continue;
				}
				// 普通字符串不允许换行，容错处理未闭合的情况
				if (quote !== '`' && code[i] === '\n') break;
				str += code[i];
				i++;
			}
			i++; // 跳过结束引号

			// 混淆特征检测
			if (/\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}/.test(str)) {
				findings.push({ where: '', feature: '转义字符', reason: '使用转义字符隐藏真实内容，常见于混淆代码' });
			}
			if (str.length > 100 && /^[A-Za-z0-9+/=\s]+$/.test(str)) {
				findings.push({ where: '', feature: '超长编码串', reason: '包含超长编码字符串，可能内嵌隐藏代码' });
			}
			// 模板字符串中 ${...} 内是可执行表达式，保留其内容继续检测
			if (quote === '`') {
				for (const match of str.matchAll(/\$\{([^{}]*)\}/g)) {
					stripped += ' ' + match[1] + ' ';
				}
			}
			stripped += '""';
			continue;
		}

		stripped += ch;
		i++;
	}

	return { stripped, findings };
}

/**
 * 检测单段 handler 代码中的风险特征
 * （启发式语法检测，可能存在漏报/误报，仅用于风险提示，不阻断执行）
 */
export function detectHandlerRisks(code: string, where = ''): HandlerRiskFinding[] {
	const { stripped, findings } = stripCommentsAndStrings(code);
	for (const { pattern, feature, reason } of DANGEROUS_PATTERNS) {
		if (pattern.test(stripped)) {
			findings.push({ where, feature, reason });
		}
	}
	// 按 位置+特征 去重
	const seen = new Set<string>();
	return findings
		.map((f) => ({ ...f, where }))
		.filter((f) => {
			const key = f.where + '|' + f.feature;
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		});
}

/** 扫描题库配置中所有可执行代码字段（handler 与 data.*.handler） */
export function scanAnswerWrapperRisks(aw: AnswererWrapper): HandlerRiskFinding[] {
	const findings: HandlerRiskFinding[] = [];
	if (typeof aw.handler === 'string') {
		findings.push(...detectHandlerRisks(aw.handler, 'handler 解析器'));
	}
	if (aw.data && typeof aw.data === 'object') {
		for (const key of Object.keys(aw.data)) {
			const field = aw.data[key];
			if (field && typeof field === 'object' && typeof field.handler === 'string') {
				findings.push(...detectHandlerRisks(field.handler, `data.${key} 字段解析器`));
			}
		}
	}
	return findings;
}

/**
 * 检测题库配置中的风险代码，若存在则弹窗警告，由用户决定是否继续使用。
 * 手动粘贴与一键获取流程统一在保存前调用。
 *
 * @returns 无风险或用户确认继续使用时返回 true，用户取消时返回 false
 */
export function confirmRiskyAnswerWrappers(aws: AnswererWrapper[]): Promise<boolean> {
	const riskList = aws
		.map((aw) => ({ name: aw.name, findings: scanAnswerWrapperRisks(aw) }))
		.filter((item) => item.findings.length > 0);

	if (riskList.length === 0) {
		return Promise.resolve(true);
	}

	return new Promise((resolve) => {
		let settled = false;
		const done = (result: boolean) => {
			if (!settled) {
				settled = true;
				resolve(result);
			}
		};

		$modal.confirm({
			width: 640,
			maskCloseable: false,
			title: '⚠️ 检测到题库配置中包含可疑代码',
			content: h('div', [
				h('div', { style: { marginBottom: '8px' } }, [
					'题库配置中的解析器（handler）会在答题时以你的登录身份执行。以下题库包含高风险代码特征，可能被用于窃取账号信息、篡改页面或执行其他恶意操作：'
				]),
				...riskList.map((item) =>
					h(
						'div',
						{
							style: {
								margin: '8px 0',
								padding: '8px',
								border: '1px solid #ffccc7',
								borderRadius: '4px',
								background: '#fff2f0'
							}
						},
						[
							h('div', { style: { fontWeight: 'bold', marginBottom: '4px' } }, `题库：${item.name}`),
							h(
								'ul',
								{ style: { margin: '0', paddingLeft: '20px' } },
								item.findings.map((f) => h('li', `${f.where ? f.where + ' - ' : ''}${f.feature}：${f.reason}`))
							)
						]
					)
				),
				h('div', { style: { marginTop: '8px', color: '#cf1322' } }, [
					'如果你不理解以上内容，或者配置来自陌生人/非官方渠道，请点击「取消」，并从官方渠道重新获取题库配置。'
				])
			]),
			confirmButtonText: '我了解风险，仍然使用',
			cancelButtonText: '取消（推荐）',
			onConfirm: () => done(true),
			onCancel: () => done(false),
			// 点击遮罩/关闭按钮与取消等价
			onClose: () => done(false)
		});
	});
}
