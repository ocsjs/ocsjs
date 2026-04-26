import {
	OCSWorker,
	createDefaultQuestionResolver,
	defaultAnswerWrapperHandler,
	QuestionTypes,
	SimplifyWorkResult,
	WorkerEvents
} from '@ocsjs/core';
import { $, $elements, Project, Script, $message, $modal, $el, $ui, CommonEventEmitter } from 'easy-us';
import { $msg, CommonWorkOptions, playMedia } from '../utils';
import { restudy, volume } from '../utils/configs';
import { waitForElement } from '../utils/study';
import { commonWork, optimizationElementWithImage, simplifyWorkResult } from '../utils/work';
import { BackgroundProject } from './background';
import { CommonProject } from './common';
import { EXAM_FONT_GLYPH_HASH_MAP } from './yuketang.font.map';

const state = {
	study: {
		currentMedia: undefined as HTMLMediaElement | undefined
	}
};

const fontDecodeState = {
	loader: {
		opentype: null as Promise<any> | null
	},
	fontMaps: new Map<string, Map<string, string>>(),
	fontLoads: new Map<string, Promise<Map<string, string>>>()
};

export const YKTProject = Project.create({
	name: '雨课堂',
	domains: ['yuketang.cn', 'gdufemooc.cn'],
	scripts: {
		guide: new Script({
			name: '🖥️ 使用提示',
			matches: [['雨课堂课程列表', 'https://www.yuketang.cn/v2/web/index']],
			namespace: 'yuketang.study.guide',
			configs: {
				notes: {
					defaultValue: '请点击课程里面任意章节，进入学习。'
				}
			}
		}),
		global: new Script({
			name: '全局脚本',
			matches: [['全部界面', /.*/]],
			hideInPanel: true,
			onstart(...args) {
				// 雨课堂反混淆，雨课堂修改了 attachShadow 方法
				// 这里重写removeChild方法，防止删除wrapper元素
				const _removeChild = Element.prototype.removeChild;
				Element.prototype.removeChild = function (e) {
					if (e.nodeName === 'DIV') {
						if ($elements.wrapper && e === ($elements.wrapper as Node)) {
							($elements.wrapper as HTMLElement).removeAttribute('style');
							return e;
						}
					}
					_removeChild.call(this, e);
					return e;
				};
			}
		}),
		ai: new Script({
			name: '🤖 AI学伴',
			matches: [['AI学伴课程界面', 'https://www.yuketang.cn/ai-workspace/lms-graph']],
			namespace: 'yuketang.study.ai',
			configs: {
				notes: {
					defaultValue: '请点击任意章节，进入学习。'
				},
				restudy: restudy,
				reloadWhenError: {
					label: '黑屏自动刷新',
					attrs: { title: '视频黑屏或者检测不到视频时自动刷新页面', type: 'checkbox' },
					defaultValue: true
				},
				volume: volume,
				playbackRate: {
					label: '视频倍速',
					tag: 'select',
					defaultValue: 1,
					options: [
						['1', '1 x'],
						['1.25', '1.25 x'],
						['1.5', '1.5 x'],
						['2.0', '2.0 x']
					]
				}
			},
			async oncomplete() {
				await $.sleep(3000);
				CommonProject.scripts.render.methods.pin(this);

				// 监听音量
				this.onConfigChange('volume', (curr) => {
					state.study.currentMedia && (state.study.currentMedia.volume = curr);
				});

				// 监听速度
				this.onConfigChange('playbackRate', (curr) => {
					state.study.currentMedia && (state.study.currentMedia.playbackRate = curr);
				});

				// // 展开5次章节，确保所有章节都被展开
				const max_level = 5;
				for (let i = 0; i < max_level; i++) {
					document.querySelectorAll<HTMLElement>('.expand-icon:not(.is-expanded )').forEach((el) => el.click());
					await $.sleep(100);
				}

				const getJobs = () => Array.from(document.querySelectorAll<HTMLElement>('div.leaf-item'));
				const getJobName = () =>
					document.querySelector('.leaf-item.is-active .leaf-item-title')?.textContent || '未知任务点';
				const getNextJob = () => {
					let jobs = getJobs();
					const active_index = jobs.findIndex((job) => job.classList.contains('is-active'));

					// 不是复习模式，过滤掉已经完成的
					if (!this.cfg.restudy) {
						jobs = jobs.splice(active_index);
						jobs = jobs.filter((el) => !el.querySelector('.icon-yuanquangou'));
						jobs = jobs.filter((el) => !(el.querySelector('.leaf-item-tag')?.textContent || '').includes('自测'));
					}
					const new_active_index = jobs.findIndex((job) => job.classList.contains('is-active'));
					return jobs[new_active_index + 1];
				};

				try {
					$msg.info('等待任务加载中...');
					await waitForElement('.detail-container', {
						timeout_seconds: 10 * 1000
					});
					$msg.info('即将开始自动学习');
				} catch (e) {
					$message.error('元素加载失败，请刷新界面重试。');
				}

				const study = async () => {
					try {
						if ($el('.detail-container video')) {
							$msg.info('即将开始视频学习：' + getJobName());
							await watch({
								volume: this.cfg.volume,
								playbackRate: this.cfg.playbackRate
							});
							$msg.success('视频学习完成');
							await $.sleep(3000);
						}

						if ($el('.detail-container .problem-common')) {
							$msg.warn('自测任务暂未支持，请联系作者反馈：' + getJobName());
							await $.sleep(3000);
						}
					} catch (e) {
						$message.error(`当前任务点无法完成，即将跳转下一节（${e}）`);
					}
					const next = getNextJob();
					if (!next) {
						return $modal.alert({
							content: '检测到当前视频全部播放完毕，如果还有未完成的视频请刷新重试，或者打开复习模式。'
						});
					}
					next.click();
					await $.sleep(200);
					next.scrollIntoView({ behavior: 'smooth', block: 'center' });
					await $.sleep(3000);
					study();
				};

				study();
			}
		}),
		work: new Script({
			name: '✍️ 作业考试',
			matches: [['雨课堂作业/考试页面', /\/exercise\/|\/exam\//]],
			namespace: 'yuketang.work',
			configs: {
				notes: {
					defaultValue: $ui.notes([
						'自动答题前请在 “通用-全局设置” 中设置题库配置。',
						'支持雨课堂作业/考试页面的题库搜索、答题结果面板和题库缓存。',
						'如果题目未加载完成，请等待页面稳定后再开始答题。'
					]).outerHTML
				}
			},
			oncomplete() {
				if (!isYktWorkPage()) {
					return;
				}
				commonWork(this, {
					enable_control_panel: true,
					workerProvider: (opt) => workOrExam(opt)
				});
			}
		}),
		'font-decrypt': new Script({
			name: '🔤 字体解密',
			matches: [['雨课堂加密字体页面', /\/v2\/web\/iframe-self-test|\/exercise\/|\/exam\//]],
			async oncomplete() {
				try {
					$msg.info('正在解析雨课堂加密字体');
					const result = await decodeElementInPlace(document.body);
					if (result.skipped > 0) {
						$msg.warn(`雨课堂字体映射未命中，已保留 ${result.skipped} 个加密元素`);
					} else {
						$msg.success(`字体替换完成，共处理 ${result.decoded} 个元素`);
					}
					console.log('字体替换完成', result);
				} catch (err) {
					$msg.error('字体解密失败，请刷新页面重试：' + String(err));
				}
			}
		})
	}
});

function getHostWindow() {
	try {
		const hostWindow = (globalThis as any).unsafeWindow;
		if (hostWindow) {
			return hostWindow as Window;
		}
	} catch {}
	return window;
}

function getMainDocument() {
	return getHostWindow().document || document;
}

function loadExternalScriptOnce(src: string, globalName: string, stateKey: 'opentype'): Promise<any> {
	const hostWindow = getHostWindow() as any;
	if (hostWindow[globalName]) {
		return Promise.resolve(hostWindow[globalName]);
	}
	if (fontDecodeState.loader[stateKey]) {
		return fontDecodeState.loader[stateKey]!;
	}

	fontDecodeState.loader[stateKey] = new Promise((resolve, reject) => {
		const script = hostWindow.document.createElement('script');
		script.src = src;
		script.async = true;
		script.onload = () => {
			if (hostWindow[globalName]) {
				resolve(hostWindow[globalName]);
			} else {
				reject(new Error(`script loaded but missing global ${globalName}`));
			}
		};
		script.onerror = () => reject(new Error(`failed to load script: ${src}`));
		hostWindow.document.head.appendChild(script);
	});

	return fontDecodeState.loader[stateKey]!;
}

function withTimeout<T>(promise: Promise<T>, ms: number, label = 'timeout'): Promise<T> {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error(label)), ms);
		promise.then(
			(value) => {
				clearTimeout(timer);
				resolve(value);
			},
			(error) => {
				clearTimeout(timer);
				reject(error);
			}
		);
	});
}

function toArrayBuffer(value: any): ArrayBuffer | null {
	if (value instanceof ArrayBuffer) {
		return value;
	}
	if (ArrayBuffer.isView(value)) {
		return value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength);
	}
	return null;
}

function requestArrayBuffer(url: string) {
	return new Promise<ArrayBuffer>((resolve, reject) => {
		const gmRequest = (globalThis as any).GM_xmlhttpRequest || (window as any).GM_xmlhttpRequest;
		if (typeof gmRequest === 'function') {
			gmRequest({
				method: 'GET',
				url,
				responseType: 'arraybuffer',
				timeout: 15000,
				onload: (response: any) => {
					const status = Number(response?.status || 0);
					if (status && (status < 200 || status >= 300)) {
						reject(new Error(`download font failed: ${status}`));
						return;
					}
					const buffer = toArrayBuffer(response?.response);
					if (buffer) {
						resolve(buffer);
					} else {
						reject(new Error('font response is not arraybuffer'));
					}
				},
				onerror: (error: any) => reject(error instanceof Error ? error : new Error(String(error))),
				ontimeout: () => reject(new Error('download font timeout'))
			});
			return;
		}

		const hostWindow = getHostWindow() as any;
		const xhr = new hostWindow.XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = 'arraybuffer';
		xhr.timeout = 15000;
		xhr.onload = () => {
			if (xhr.status && (xhr.status < 200 || xhr.status >= 300)) {
				reject(new Error(`download font failed: ${xhr.status}`));
				return;
			}
			const buffer = toArrayBuffer(xhr.response);
			if (buffer) {
				resolve(buffer);
			} else {
				reject(new Error('font response is not arraybuffer'));
			}
		};
		xhr.onerror = () => reject(new Error('download font failed'));
		xhr.ontimeout = () => reject(new Error('download font timeout'));
		xhr.send();
	});
}

async function ensureFontDecodeDependencies() {
	const hostWindow = getHostWindow() as any;
	if (!hostWindow.opentype) {
		await withTimeout(
			loadExternalScriptOnce(
				'https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/dist/opentype.min.js',
				'opentype',
				'opentype'
			),
			15000,
			'load opentype.js timeout'
		);
	}
}

function normalizeScrapeText(text: string) {
	return String(text || '')
		.replace(/上一题|下一题|已提交|收起解析|查看解析/g, '')
		.replace(/^\s*[\r\n]/gm, '')
		.trim();
}

function normalizeFontFamilyName(value: string) {
	return String(value || '')
		.split(',')[0]
		.replace(/["']/g, '')
		.trim()
		.toLowerCase();
}

function getEncryptedFontInfo(element: HTMLElement) {
	const doc = element.ownerDocument || document;
	const family =
		normalizeFontFamilyName(getHostWindow().getComputedStyle(element).fontFamily) || 'exam-data-decrypt-font';
	let src = '';

	for (const styleSheet of Array.from(doc.styleSheets || [])) {
		let rules: CSSRuleList | undefined;
		try {
			rules = styleSheet.cssRules;
		} catch {
			continue;
		}
		if (!rules) {
			continue;
		}
		for (const rule of Array.from(rules)) {
			if (rule.type !== CSSRule.FONT_FACE_RULE) {
				continue;
			}
			const ff = rule as CSSFontFaceRule;
			const ruleFamily = normalizeFontFamilyName(ff.style.getPropertyValue('font-family'));
			if (ruleFamily !== family) {
				continue;
			}
			const srcText = String(ff.style.getPropertyValue('src') || '').trim();
			const urlMatch = srcText.match(/url\((['"]?)(.*?)\1\)/i);
			src = urlMatch ? urlMatch[2] : srcText;
			if (src) {
				try {
					src = new URL(src, doc.baseURI || location.href).toString();
				} catch {}
				break;
			}
		}
		if (src) {
			break;
		}
	}
	return { family, src, signature: `${family}|${src}` };
}

function getGlyphPathSignature(font: any, glyph: any) {
	const commands = glyph.getPath(0, 0, font.unitsPerEm).commands;
	const parts: string[] = [];
	for (const cmd of commands) {
		parts.push(cmd.type);
		if ('x' in cmd) {
			parts.push(Number(cmd.x).toFixed(3));
			parts.push(Number(cmd.y).toFixed(3));
		}
		if ('x1' in cmd) {
			parts.push(Number(cmd.x1).toFixed(3));
			parts.push(Number(cmd.y1).toFixed(3));
		}
		if ('x2' in cmd) {
			parts.push(Number(cmd.x2).toFixed(3));
			parts.push(Number(cmd.y2).toFixed(3));
		}
	}
	return parts.join('|');
}

function fnv1a64(text: string) {
	const Big = BigInt;
	let hash = Big('0xcbf29ce484222325');
	const mask = Big('0xffffffffffffffff');
	const prime = Big('0x100000001b3');
	const bytes = new TextEncoder().encode(String(text || ''));
	for (const byte of bytes) {
		hash ^= BigInt(byte);
		hash = (hash * prime) & mask;
	}
	return hash.toString(16).padStart(16, '0');
}

async function ensureFontCharMap(fontInfo: { signature: string; src: string }) {
	if (fontDecodeState.fontMaps.has(fontInfo.signature)) {
		return fontDecodeState.fontMaps.get(fontInfo.signature)!;
	}
	if (fontDecodeState.fontLoads.has(fontInfo.signature)) {
		return fontDecodeState.fontLoads.get(fontInfo.signature)!;
	}

	const loadPromise = (async () => {
		const charMap = new Map<string, string>();
		try {
			if (!fontInfo.src) {
				throw new Error('missing font url');
			}
			await ensureFontDecodeDependencies();
			const opentype = (getHostWindow() as any).opentype || (window as any).opentype;
			if (!opentype) {
				throw new Error('opentype.js not ready');
			}
			const buffer = await withTimeout(requestArrayBuffer(fontInfo.src), 15000, 'download font timeout');
			const font = opentype.parse(buffer);
			const cmap = font?.tables?.cmap?.glyphIndexMap || font?.encoding?.cmap?.glyphIndexMap || {};
			for (const cpStr of Object.keys(cmap)) {
				const fakeChar = String.fromCodePoint(Number(cpStr));
				const glyphIndex = cmap[cpStr];
				const glyph = font.glyphs.get(glyphIndex);
				if (!glyph) {
					continue;
				}
				const glyphHash = fnv1a64(getGlyphPathSignature(font, glyph));
				const realChar = EXAM_FONT_GLYPH_HASH_MAP[glyphHash];
				if (realChar) {
					charMap.set(fakeChar, realChar);
				}
			}
		} catch (error) {
			console.error('yuketang font decode failed', error);
		}
		fontDecodeState.fontMaps.set(fontInfo.signature, charMap);
		fontDecodeState.fontLoads.delete(fontInfo.signature);
		return charMap;
	})();

	fontDecodeState.fontLoads.set(fontInfo.signature, loadPromise);
	return loadPromise;
}

function isEncryptedGlyphElement(element: Element) {
	if (!(element instanceof HTMLElement)) {
		return false;
	}
	if (element.classList.contains('xuetangx-com-encrypted-font')) {
		return true;
	}
	const family = getHostWindow().getComputedStyle(element).fontFamily || '';
	return /exam-data-decrypt-font/i.test(family);
}

function getEncryptedLeafElements(root: HTMLElement) {
	const nodes = [root, ...Array.from(root.querySelectorAll('*'))].filter((node) =>
		isEncryptedGlyphElement(node as Element)
	) as HTMLElement[];
	return nodes.filter(
		(node) => !Array.from(node.querySelectorAll('*')).some((child) => isEncryptedGlyphElement(child))
	);
}

function decodeTextByCharMap(text: string, charMap: Map<string, string>) {
	return Array.from(String(text || ''))
		.map((ch) => {
			if (!ch || /\s/.test(ch)) {
				return ch;
			}
			return charMap.get(ch) || ch;
		})
		.join('');
}

async function decodeEncryptedElement(element: HTMLElement) {
	const encryptedText = String(element.innerText || element.textContent || '');
	const fontInfo = getEncryptedFontInfo(element);
	const charMap = await ensureFontCharMap(fontInfo);
	return {
		text: normalizeScrapeText(decodeTextByCharMap(encryptedText, charMap)),
		fontInfo,
		hasMap: charMap.size > 0
	};
}

async function decodeElementInPlace(element: HTMLElement) {
	const encryptedLeaves = getEncryptedLeafElements(element);
	const unmatchedFonts = new Set<string>();
	let decoded = 0;
	let skipped = 0;
	for (const leaf of encryptedLeaves) {
		const result = await decodeEncryptedElement(leaf);
		if (!result.hasMap) {
			skipped++;
			unmatchedFonts.add(result.fontInfo.src || result.fontInfo.signature);
			continue;
		}
		leaf.textContent = result.text;
		leaf.classList.remove('xuetangx-com-encrypted-font');
		leaf.style.fontFamily = 'inherit';
		decoded++;
	}
	if (unmatchedFonts.size > 0) {
		console.warn('[ocs:yuketang] font glyph map not matched; keeping encrypted font text.', {
			fonts: Array.from(unmatchedFonts)
		});
	}
	return { total: encryptedLeaves.length, decoded, skipped, unmatchedFonts: Array.from(unmatchedFonts) };
}

function normalizeDecodedText(text: string) {
	let normalized = String(text || '').replace(/\r/g, '');
	const collapseChineseSpacing = (value: string) => {
		let output = value;
		let previous = '';
		while (output !== previous) {
			previous = output;
			output = output
				.replace(/([\u4e00-\u9fff])\s+([\u4e00-\u9fff])/g, '$1$2')
				.replace(
					/([\u4e00-\u9fff])\s+([()\uFF08\uFF09,.\uFF0C\u3002\u3001\u201C\u201D\u300A\u300B\u3010\u3011])/g,
					'$1$2'
				)
				.replace(
					/([()\uFF08\uFF09,.\uFF0C\u3002\u3001\u201C\u201D\u300A\u300B\u3010\u3011])\s+([\u4e00-\u9fff])/g,
					'$1$2'
				)
				.replace(/([A-H])\s+([\u4e00-\u9fff])/g, '$1 $2');
		}
		return output;
	};

	normalized = normalized.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').replace(/[ ]{2,}/g, ' ');

	const lines = normalized
		.split('\n')
		.map((line) => collapseChineseSpacing(line.trim()))
		.filter(Boolean)
		.filter((line) => !/^(上一题|下一题|提交|交卷)$/u.test(line))
		.filter((line) => !/^上[\s-]*一[\s-]*题[\s-]*下[\s-]*一[\s-]*题$/u.test(line))
		.filter((line) => !/^上[\s-]*[-是一]*[\s-]*下[\s-]*[-是一]*$/u.test(line));

	return lines.join('\n').replace(/[\uFF08(]\s+/g, '(').replace(/\s+[\uFF09)]/g, ')').trim();
}

async function prepareJudgeLabels(root: HTMLElement) {
	const labels = Array.from(
		root.querySelectorAll<HTMLElement>(
			'label.el-radio, label.homeworkElRadio, label.el-checkbox, label.homeworkElCheckbox'
		)
	);
	for (const label of labels) {
		if ((label.innerText || label.textContent || '').trim()) {
			continue;
		}
		const input = label.querySelector<HTMLInputElement>('input[type="radio"], input[type="checkbox"]');
		if (!input) {
			continue;
		}
		const value = String(input.value || '').trim().toLowerCase();
		const labelSpan = label.querySelector<HTMLElement>('.el-radio__label, .el-checkbox__label') || label;
		if (value === 'true') {
			labelSpan.append('正确');
		}
		if (value === 'false') {
			labelSpan.append('错误');
		}
	}
}

async function prepareQuestionRoot(root: HTMLElement) {
	await decodeElementInPlace(root);
	await prepareJudgeLabels(root);
}

function isYktWorkPage() {
	return location.pathname.includes('/exercise/') || location.pathname.includes('/exam/');
}

function getTargetDocument(mainDoc: Document = getMainDocument()) {
	let targetDoc = mainDoc;
	const iframes = mainDoc.querySelectorAll('iframe');
	for (const iframe of Array.from(iframes)) {
		try {
			const contentDocument = (iframe as HTMLIFrameElement).contentDocument;
			if (contentDocument && (contentDocument.body.innerText || contentDocument.body.textContent || '').length > 50) {
				targetDoc = contentDocument;
				break;
			}
		} catch {}
	}
	return targetDoc;
}

function getSidebarButtons(targetDoc: Document) {
	const buttons = Array.from(
		targetDoc.querySelectorAll<HTMLElement>(
			'.subject-item.J_order, .answer-status, .question-list .btn, .nav-item, .question-nav .number'
		)
	).filter((button) => {
		const text = (button.innerText || button.textContent || '').trim();
		return text && !button.hasAttribute('disabled');
	});
	return Array.from(new Set(buttons));
}

function getQuestionRoots(targetDoc: Document = getTargetDocument()) {
	const roots = Array.from(
		targetDoc.querySelectorAll<HTMLElement>('.container-problem, .problem-common, .problem-item')
	).filter((root) => {
		const text = (root.innerText || root.textContent || '').trim();
		return text || root.querySelector('label, input, textarea');
	});
	return roots.filter((root) => !roots.some((other) => other !== root && other.contains(root)));
}

async function waitForQuestionRoot(targetDoc: Document = getTargetDocument(), timeout = 15000) {
	const start = Date.now();
	while (Date.now() - start < timeout) {
		const root = getQuestionRoots(targetDoc)[0];
		if (root) {
			return root;
		}
		await $.sleep(200);
	}
	throw new Error('未检测到雨课堂题目容器');
}

function extractQuestionTextFromContainer(container: HTMLElement) {
	return normalizeDecodedText(container.innerText || container.textContent || '');
}

function extractStemFromQuestionText(text: string) {
	let normalized = normalizeDecodedText(text);
	normalized = normalized
		.replace(
			/^\s*\d+\.\s*(?:\u5355\u9009\u9898|\u591a\u9009\u9898|\u5224\u65ad\u9898|\u586b\u7a7a\u9898|\u7b80\u7b54\u9898|\u95ee\u7b54\u9898)?\s*(?:\([^)]*\))?\s*/,
			''
		)
		.trim();

	const answerInfoIndex = normalized.search(
		/(\u672c\u9898\u5f97\u5206|\u6b63\u786e\u7b54\u6848|\u89e3\u6790[:\uff1a]?|\u67e5\u770b\u89e3\u6790|\u6536\u8d77\u89e3\u6790|\u4e0a\u4e00\u9898|\u4e0b\u4e00\u9898|\u5df2\u63d0\u4ea4)/
	);
	if (answerInfoIndex > -1) {
		normalized = normalized.slice(0, answerInfoIndex).trim();
	}

	const inlineOptionIndex = normalized.search(/\s+A[\s.\u3001\uff0e:\uff1a)\uff09]*(?=\S)[^\n]*\s+B[\s.\u3001\uff0e:\uff1a)\uff09]*(?=\S)/);
	if (inlineOptionIndex > -1) {
		normalized = normalized.slice(0, inlineOptionIndex).trim();
	}
	normalized = normalized
		.replace(/\s*(?:\u6b63\u786e|\u9519\u8bef)\s*(?:\u6b63\u786e|\u9519\u8bef)\s*$/, '')
		.trim();

	const lines = normalized
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);
	const stemParts: string[] = [];
	let startIndex = 0;
	if (lines[0] && /^\d+\.\s*\S+题/.test(lines[0])) {
		startIndex = 1;
	}
	if (lines[startIndex] && /^\(\d+分\)$/.test(lines[startIndex])) {
		startIndex += 1;
	}
	for (let i = startIndex; i < lines.length; i++) {
		const line = lines[i];
		if (/^[A-H][\s.、:：)）]/.test(line)) {
			break;
		}
		if (/^(本题得分|正确答案|填空\d+[：:]|解析[:：]|查看解析|收起解析)/.test(line)) {
			break;
		}
		stemParts.push(line);
	}
	return stemParts.join(' ').trim();
}

function createTextElement(text: string, doc: Document = getMainDocument()) {
	const element = doc.createElement('div');
	element.textContent = text;
	element.innerText = text;
	return element;
}

function getQuestionTitle(root: HTMLElement) {
	const titleSource =
		root.querySelector<HTMLElement>('.problem-body, .item-body, .question-title, .stem, .problem-title') || root;
	const titleText = extractStemFromQuestionText(extractQuestionTextFromContainer(titleSource));
	return titleText || extractStemFromQuestionText(extractQuestionTextFromContainer(root));
}

function getQuestionTitleElements(root: HTMLElement) {
	return [createTextElement(getQuestionTitle(root), root.ownerDocument || getMainDocument())];
}

function getQuestionOptionElements(root: HTMLElement) {
	const labels = Array.from(
		root.querySelectorAll<HTMLElement>(
			'label.el-radio, label.homeworkElRadio, label.el-checkbox, label.homeworkElCheckbox'
		)
	);
	if (labels.length) {
		return labels;
	}
	return Array.from(
		root.querySelectorAll<HTMLElement>('input[type="text"], textarea, .el-input__inner, .el-textarea__inner')
	);
}

function getQuestionType(root: HTMLElement, options: HTMLElement[]): QuestionTypes {
	const typeText = normalizeDecodedText(
		root.querySelector<HTMLElement>('.item-type, .problem-type, .question-type')?.innerText ||
			root.querySelector<HTMLElement>('.item-type, .problem-type, .question-type')?.textContent ||
			''
	);
	if (typeText.includes('判断')) {
		return 'judgement';
	}
	if (typeText.includes('多选')) {
		return 'multiple';
	}
	if (typeText.includes('单选')) {
		return 'single';
	}
	if (typeText.includes('填空')) {
		return 'completion';
	}

	const radioCount = options.filter((option) => option.querySelector('input[type="radio"]')).length;
	const checkboxCount = options.filter((option) => option.querySelector('input[type="checkbox"]')).length;
	const completionCount = options.filter((option) => {
		const element = getTextControl(option);
		return !!element;
	}).length;

	if (completionCount) {
		return 'completion';
	}
	if (checkboxCount) {
		return 'multiple';
	}
	if (radioCount) {
		return radioCount === 2 ? 'judgement' : 'single';
	}
	return undefined;
}

function getOptionSearchText(option: HTMLElement) {
	const input = option.querySelector<HTMLInputElement>('input[type="radio"], input[type="checkbox"]');
	let text = normalizeDecodedText(optimizationElementWithImage(option, true).innerText || option.textContent || '');
	if (!text && input) {
		const value = String(input.value || '').trim().toLowerCase();
		if (value === 'true') {
			text = '正确';
		}
		if (value === 'false') {
			text = '错误';
		}
	}
	return text
		.replace(/^[A-H][\s.、:：)）]*/i, '')
		.replace(/^\d+[.、:：)）]*/, '')
		.trim();
}

function cleanOptionSearchText(text: string) {
	return String(text || '')
		.replace(/^(.+?)(?:\u6b63\u786e|\u9519\u8bef)$/, '$1')
		.trim();
}

function isOptionChecked(option: HTMLElement) {
	const input = option.querySelector<HTMLInputElement>('input[type="radio"], input[type="checkbox"]');
	return !!(
		input?.checked ||
		option.classList.contains('is-checked') ||
		option.querySelector('.is-checked') ||
		option.getAttribute('aria-checked') === 'true'
	);
}

function getTextControl(option: HTMLElement) {
	const tagName = option.tagName.toUpperCase();
	if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
		return option as HTMLInputElement | HTMLTextAreaElement;
	}
	return option.querySelector<HTMLInputElement | HTMLTextAreaElement>(
		'input[type="text"], textarea, .el-input__inner, .el-textarea__inner'
	);
}

function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
	const win = element.ownerDocument.defaultView || window;
	const prototype = element.tagName.toUpperCase() === 'TEXTAREA' ? win.HTMLTextAreaElement.prototype : win.HTMLInputElement.prototype;
	const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
	if (descriptor?.set) {
		descriptor.set.call(element, value);
	} else {
		element.value = value;
	}
	element.dispatchEvent(new win.Event('input', { bubbles: true }));
	element.dispatchEvent(new win.Event('change', { bubbles: true }));
}

async function handleQuestionAnswer(type: QuestionTypes, answer: string, option: HTMLElement) {
	if (type === 'single' || type === 'multiple' || type === 'judgement') {
		if (!isOptionChecked(option)) {
			option.scrollIntoView({ behavior: 'smooth', block: 'center' });
			option.click();
			await $.sleep(300);
		}
		return;
	}
	if (type === 'completion' && answer.trim()) {
		const textControl = getTextControl(option);
		if (textControl) {
			textControl.focus();
			setNativeValue(textControl, answer);
			await $.sleep(200);
		}
	}
}

function titleTransform(titles: (HTMLElement | undefined)[]) {
	return titles
		.map((title) => title?.innerText || title?.textContent || '')
		.filter(Boolean)
		.join(',')
		.trim();
}

function getDefinedElements(elements: (HTMLElement | undefined)[] | undefined) {
	return (elements || []).filter((element): element is HTMLElement => Boolean(element));
}

function createQuestionWorker(
	roots: HTMLElement[],
	options: CommonWorkOptions,
	allResults: (SimplifyWorkResult | undefined)[],
	resultOffset = 0
) {
	const { answererWrappers, period, thread, answerSeparators, answerMatchMode } = options;
	return new OCSWorker({
		root: roots,
		elements: {
			title: (root) => getQuestionTitleElements(root as HTMLElement),
			options: (root) => getQuestionOptionElements(root as HTMLElement)
		},
		thread: thread ?? 1,
		answerSeparators: answerSeparators.split(',').map((separator) => separator.trim()),
		answerMatchMode,
		answerer: async (elements, ctx) => {
			const title = titleTransform(elements.title || []);
			if (!title) {
				throw new Error('题目为空，请查看题目是否为空，或者忽略此题。');
			}
			const optionElements = getDefinedElements(ctx.elements.options);
			ctx.type = getQuestionType(ctx.root, optionElements);
			const optionText =
				ctx.type === 'completion' ? '' : optionElements.map((option) => cleanOptionSearchText(getOptionSearchText(option))).join('\n');
			return CommonProject.scripts.apps.methods.searchAnswerInCaches(title, async () => {
				await $.sleep((period ?? 3) * 1000);
				return defaultAnswerWrapperHandler(answererWrappers, {
					type: ctx.type || 'unknown',
					title,
					options: optionText
				});
			});
		},
		work: async (ctx) => {
			const optionElements = getDefinedElements(ctx.elements.options);
			ctx.type = getQuestionType(ctx.root, optionElements);
			if (!ctx.type) {
				return { finish: false, error: '题型识别失败' };
			}
			const resolver = createDefaultQuestionResolver(ctx)[ctx.type];
			if (ctx.type === 'completion') {
				return resolver(ctx.searchInfos, optionElements, handleQuestionAnswer);
			}

			const proxyMap = new Map<HTMLElement, HTMLElement>();
			const proxyOptions = optionElements.map((option) => {
				const proxy = createTextElement(cleanOptionSearchText(getOptionSearchText(option)), option.ownerDocument || getMainDocument());
				proxyMap.set(proxy, option);
				return proxy;
			});
			return resolver(ctx.searchInfos, proxyOptions, async (type, answer, proxyOption) => {
				await handleQuestionAnswer(type, answer, proxyMap.get(proxyOption) || proxyOption);
			});
		},
		onResultsUpdate(current, _, results) {
			const simplified = simplifyWorkResult(results, titleTransform);
			for (let index = 0; index < simplified.length; index++) {
				allResults[resultOffset + index] = simplified[index];
			}
			CommonProject.scripts.workResults.methods.setResults(
				allResults.filter((result): result is SimplifyWorkResult => Boolean(result))
			);
			CommonProject.scripts.workResults.methods.updateWorkStateByResults(results);
			if (current.result?.finish) {
				CommonProject.scripts.apps.methods.addQuestionCacheFromWorkResult(simplifyWorkResult([current], titleTransform));
			}
		}
	});
}

async function prepareRoots(roots: HTMLElement[]) {
	for (const root of roots) {
		await prepareQuestionRoot(root);
	}
}

async function waitForContinue(isStopping: () => boolean, isClosed: () => boolean) {
	while (isStopping() && !isClosed()) {
		await $.sleep(200);
	}
}

function shouldUpload(upload: CommonWorkOptions['upload'], finishedRate: number) {
	if (upload === 'nomove') {
		return undefined;
	}
	if (upload === 'force') {
		return true;
	}
	if (upload === 'save') {
		return false;
	}
	const targetRate = parseFloat(String(upload));
	return Number.isFinite(targetRate) && finishedRate >= targetRate;
}

async function submitCurrentAnswer(targetDoc: Document, questionIndex: number, mode: 'question' | 'final') {
	const submitSelectors = [
		'.submit-btn',
		'.btn-submit',
		'button.submit',
		'.el-button--primary',
		'.homework-submit',
		'.paper-submit',
		'button[type="submit"]'
	];
	const submitTexts = mode === 'final' ? ['交卷', '提交'] : ['提交'];
	for (const selector of submitSelectors) {
		const button = targetDoc.querySelector<HTMLElement>(selector);
		if (!button) {
			continue;
		}
		const buttonText = (button.innerText || button.textContent || '').trim();
		if (!submitTexts.some((text) => buttonText.includes(text))) {
			continue;
		}
		if (button.hasAttribute('disabled') || /已提交|已交|已完成/.test(buttonText)) {
			continue;
		}
		button.click();
		$message.info(mode === 'final' ? '已点击最终提交按钮' : `第 ${questionIndex} 题已点击提交按钮`);
		await $.sleep(1200);
		for (const confirmSelector of [
			'.el-message-box__btns .el-button--primary',
			'.el-dialog__footer .el-button--primary',
			'.modal-footer .btn-primary',
			'button.confirm',
			'.confirm-btn'
		]) {
			const confirmButton =
				getMainDocument().querySelector<HTMLElement>(confirmSelector) ||
				targetDoc.querySelector<HTMLElement>(confirmSelector);
			if (confirmButton && /(确|提交|交卷)/.test((confirmButton.innerText || confirmButton.textContent || '').trim())) {
				confirmButton.click();
				await $.sleep(1200);
				break;
			}
		}
		return true;
	}
	return false;
}

async function submitByGlobalSetting(options: CommonWorkOptions, results: SimplifyWorkResult[]) {
	const decision = shouldUpload(options.upload, results.length ? (results.filter((result) => result.finish).length / results.length) * 100 : 0);
	if (decision === undefined) {
		return;
	}
	if (!decision) {
		$message.info({ content: '雨课堂答题完成，已按配置保留答案不提交。', duration: 0 });
		return;
	}
	$message.info({ content: `答题完成，将等待 ${options.stopSecondWhenFinish} 秒后尝试提交。`, duration: options.stopSecondWhenFinish });
	await $.sleep(options.stopSecondWhenFinish * 1000);
	const targetDoc = getTargetDocument();
	if (location.pathname.includes('/exercise/')) {
		const sidebarButtons = getSidebarButtons(targetDoc);
		if (sidebarButtons.length > 1) {
			for (let index = 0; index < sidebarButtons.length; index++) {
				sidebarButtons[index].click();
				await $.sleep(800);
				await submitCurrentAnswer(getTargetDocument(), index + 1, 'question');
			}
			return;
		}
	}
	await submitCurrentAnswer(targetDoc, results.length, 'final');
}

function workOrExam(options: CommonWorkOptions) {
	$message.info({ content: '开始雨课堂作业/考试' });
	CommonProject.scripts.workResults.methods.init();

	const runner = new CommonEventEmitter<WorkerEvents>();
	const allResults: (SimplifyWorkResult | undefined)[] = [];
	let currentWorker: ReturnType<typeof createQuestionWorker> | undefined;
	let closed = false;
	let stopped = false;
	let done = false;

	const finish = () => {
		if (!done) {
			done = true;
			runner.emit('done');
		}
	};

	runner.once('close', () => {
		closed = true;
		currentWorker?.emit('close');
	});
	runner.on('stop', () => {
		stopped = true;
		currentWorker?.emit('stop');
	});
	runner.on('continuate', () => {
		stopped = false;
		currentWorker?.emit('continuate');
	});

	(async () => {
		try {
			runner.emit('start');
			let targetDoc = getTargetDocument();
			let roots = getQuestionRoots(targetDoc);
			const sidebarButtons = getSidebarButtons(targetDoc);

			if (sidebarButtons.length > 1 && roots.length <= 1) {
				for (let index = 0; index < sidebarButtons.length && !closed; index++) {
					await waitForContinue(() => stopped, () => closed);
					sidebarButtons[index].click();
					await $.sleep(1200);
					targetDoc = getTargetDocument();
					const root = await waitForQuestionRoot(targetDoc);
					await prepareRoots([root]);
					const worker = createQuestionWorker([root], options, allResults, index);
					currentWorker = worker;
					if (stopped) {
						worker.emit('stop');
					}
					await worker.doWork({ enable_debug: BackgroundProject.scripts.dev.cfg.enable_answerer_debug });
				}
			} else {
				if (roots.length === 0) {
					roots = [await waitForQuestionRoot(targetDoc)];
				}
				await prepareRoots(roots);
				const worker = createQuestionWorker(roots, options, allResults);
				currentWorker = worker;
				if (stopped) {
					worker.emit('stop');
				}
				await worker.doWork({ enable_debug: BackgroundProject.scripts.dev.cfg.enable_answerer_debug });
			}

			if (closed) {
				return;
			}
			const simplifiedResults = allResults.filter((result): result is SimplifyWorkResult => Boolean(result));
			await submitByGlobalSetting(options, simplifiedResults);
			$message.success({ content: '雨课堂作业/考试完成，请自行检查后保存或提交。', duration: 0 });
		} catch (err) {
			if (!closed) {
				$message.error({ content: '雨课堂答题程序发生错误 : ' + ((err as any)?.message || err), duration: 0 });
			}
		} finally {
			currentWorker = undefined;
			finish();
		}
	})();

	return runner;
}

/**
 * 观看视频
 * @param setting
 * @returns
 */
async function watch(options: { volume: number; playbackRate: number }) {
	const set = async () => {
		// 上面操作会导致元素刷新，这里重新获取视频
		await $.sleep(1000);
		const media = (await waitForElement('.detail-container video', {
			timeout_seconds: 10 * 1000
		})) as HTMLMediaElement;
		console.log('media', media);
		await $.sleep(1000);
		state.study.currentMedia = media;

		if (media) {
			// 如果已经播放完了，则重置视频进度
			media.currentTime = 1;
			// 音量
			media.volume = options.volume;
			media.playbackRate = options.playbackRate;
		}
		return state.study.currentMedia;
	};
	$message.info('开始播放');
	const video = await set();

	if (!video) {
		throw new Error('video not found!');
	}

	return new Promise<void>((resolve, reject) => {
		const videoCheckInterval = setInterval(async () => {
			// 如果视频元素无法访问，证明已经切换了视频
			if (video?.isConnected === false) {
				clearInterval(videoCheckInterval);
				$message.info({ content: '检测到视频切换中...' });
				/**
				 * 元素无法访问证明用户切换视频了
				 * 所以不往下播放视频，而是重新播放用户当前选中的视频
				 */
				resolve();
			}
		}, 3000);

		playMedia(() => video?.play());

		video.onpause = async () => {
			if (!video?.ended) {
				await $.sleep(1000);
				video?.play();
			}
		};

		video.onended = () => {
			clearInterval(videoCheckInterval);
			// 正常切换下一个视频
			resolve();
		};
	});
}
