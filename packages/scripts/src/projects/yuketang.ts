import { $, $elements, Project, Script, $message, $modal, $el } from 'easy-us';
import { $msg, playMedia } from '../utils';
import { restudy, volume } from '../utils/configs';
import { waitForElement } from '../utils/study';
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
	domains: ['yuketang.cn'],
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
		// TODO 作业
		'font-decrypt': new Script({
			name: '🔤 字体解密',
			matches: [['雨课堂加密字体页面', /\/v2\/web\/iframe-self-test|\/exercise\/|\/exam\//]],
			async oncomplete() {
				try {
					$msg.info('正在解析雨课堂加密字体');
					const count = await decodeElementInPlace(document.body);
					$msg.success(`字体替换完成，共处理 ${count} 个元素`);
					console.log('字体替换完成', { count });
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
			const response = await withTimeout(fetch(fontInfo.src, { credentials: 'omit' }), 15000, 'download font timeout');
			if (!response.ok) {
				throw new Error(`download font failed: ${response.status}`);
			}
			const buffer = await withTimeout(response.arrayBuffer(), 15000, 'read font timeout');
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
	return normalizeScrapeText(decodeTextByCharMap(encryptedText, charMap));
}

async function decodeElementInPlace(element: HTMLElement) {
	const encryptedLeaves = getEncryptedLeafElements(element);
	let count = 0;
	for (const leaf of encryptedLeaves) {
		leaf.textContent = await decodeEncryptedElement(leaf);
		leaf.classList.remove('xuetangx-com-encrypted-font');
		leaf.style.fontFamily = 'inherit';
		count++;
	}
	return count;
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
