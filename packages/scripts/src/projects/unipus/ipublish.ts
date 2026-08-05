/* eslint-disable no-unused-vars */

import { Script, $message, $ui, h, $gm } from 'easy-us';
import { CommonProject } from '../common';
import { $, RemotePage, request } from '@ocsjs/core';
import { waitForElement } from '../../utils/study';
import { $playwright } from '../../utils/app';
import { BackgroundProject } from '../background';
import { CommonWorkOptions } from '../../utils';
import { translate } from './cloud';

const supported_question_types = {
	discussion_group: '讨论题',
	true_false_group: '判断题',
	short_answer_group: '简答题',
	single_choice_group: '单选题',
	multi_choice_group: '多选题',
	fill_blanks_group: '填空题',
	fill_blanks_choice_group: '选词填空题',
	translation_group: '翻译题',
	fill_blanks_dropdown_group: '下拉填空题',
	evaluation_group: '评价题'
};

export type UnipusMedia = {
	element?: HTMLElement;
	mediaFile: {
		fileUrl: string;
		fileName?: string;
		mediaName?: string;
		// 视频才有
		coverImage?: string;
		duration?: number;
		fileSize?: number;
		// 视频字幕
		videoSubtitleFile?: {
			fileUrl: string;
			fileName: string;
			fileType: 'text/vtt';
			fileSize: number;
			suffix: 'vtt';
			type: 'Subtitle';
		}[];
	};
	type: 'insert-image' | 'insert-video' | 'insert-audio';
};

export const UnipusIpublishScript = new Script({
	name: '🖥️ 新AI版-课程学习',
	namespace: 'unipus.ipublish.study',
	matches: [
		['新AI学习页面', 'unipus.cn/_ipublishpc_default/pc.html'],
		['内部页面', 'ipub.unipus.cn/learner/textbook/book']
		// ['OCS', 'docs.ocsjs.com']
	],
	configs: {
		notes: {
			defaultValue: $ui.notes(['测试']).outerHTML
		},
		translate: {
			defaultValue: false
		},
		/**
		 * AI提示词
		 */
		prompts: {
			defaultValue: [
				{
					discussion_group:
						'请帮我写一个关于以下主题的讨论题答案，要求内容充实，逻辑清晰，字数在200字以上：\n{{question}}\n{{option}}',
					true_false_group:
						'请帮我判断以下陈述是否正确，如果正确请回答“正确”，如果错误请帮我输出正确陈述句：\n{{question}}\n{{option}}'
				}
			] as Record<keyof typeof supported_question_types, string>[]
		},
		other_mode: {
			label: '答题模式',
			attrs: { title: '此设置包含 判断、简答、选择、填空等类型题目\n\n“跳过”则不进行该题型的自动作答' },
			tag: 'select',
			options: [
				['ai', 'AI答题'],
				['custom', '自定义回答'],
				['manually', '跳过']
			],
			defaultValue: 'ai' as 'ai' | 'custom' | 'manually'
		},
		other_mode_custom: {
			showIf: ['unipus.ai.study.other_mode', (val: string) => val === 'custom'],
			label: '自定义答题内容',
			tag: 'textarea',
			attrs: {
				type: 'text',
				title: '在此输入自定义回答内容，每行一个随机填写\n此设置包含 判断、简答、单选、填空等类型题目'
			},
			defaultValue: "不知道\n不会\n不清楚\n不懂\ni don't know\nno idea"
		},
		discussion_mode: {
			label: '讨论题模式',
			tag: 'select',
			options: [
				['copy', '随机复制其他讨论'],
				['ai', 'AI生成'],
				['manually', '跳过']
			],
			defaultValue: 'copy' as 'copy' | 'ai' | 'manually'
		},

		translation_mode: {
			label: '翻译题模式',
			tag: 'select',
			options: [
				['ai', 'AI翻译'],
				['manually', '跳过']
			],
			defaultValue: 'ai' as 'ai' | 'manually'
		},
		evaluation_mode: {
			label: '自我评分题模式',
			tag: 'select',
			options: [
				['random', '随机评分'],
				['fix', '固定评分'],
				['1r', '1-2分随机'],
				['2r', '1-3分随机'],
				['3r', '2-4分随机'],
				['4r', '3-5分随机'],
				['5r', '4-5分随机'],
				['manually', '跳过']
			],
			defaultValue: '5r' as 'random' | 'fix' | '1r' | '2r' | '3r' | '4r' | '5r' | 'manually'
		},
		evaluation_fix: {
			showIf: ['unipus.ai.study.evaluation_mode', (val: string) => val === 'fix'],
			label: '固定自我评分分数',
			defaultValue: 5,
			attrs: {
				type: 'number',
				min: 1,
				max: 5,
				step: 1
			}
		}
	},
	oncomplete() {
		CommonProject.scripts.render.methods.pin(this);
	},
	onbeforeunload() {
		this.cfg.translate = false;
	},
	async onstart() {
		if (location.href.includes('learner/textbook/book') === false) {
			return;
		}
		// 检查是否为软件环境
		const rp: RemotePage | undefined = await BackgroundProject.scripts.dev.methods.getRemotePlaywrightCurrentPage();
		// 检查是否为软件环境
		if (!rp) {
			return $playwright.showError();
		}
		// 初始化设置
		this.cfg.translate = false;

		this.onConfigChange('translate', async () => {
			if (!this.cfg.translate) {
				console.log('翻译已暂停');
				// translateBtn.textContent = '🌐 整页翻译';
				return;
			}
			// translateBtn.textContent = '🌐 翻译中...（点击暂停）';
			// const cloudApis = CommonProject.scripts.settings.cfg.cloudApis.trim();
			// if (!cloudApis) {
			// 	return $message.error('请先配置通用-全局设置-云接口的地址！');
			// }

			console.log('翻译中...');

			const texts = Array.from(
				document.querySelectorAll(
					'.editor-unordered-list,.editor-heading,.editor-heading,.editor-paragraph,.editor-content,.question-block'
				)
			)
				// 去掉New Word读写翻译
				.filter((el) => !el.querySelector('.speaker_svgView__kIA2V'))
				.filter((i) => (i?.textContent?.trim() ? /[A-Za-z0-9]/.test(i.textContent.trim()) : false))
				.map((el) => {
					return Array.from(
						el.querySelectorAll('[data-lexical-text="true"],[data-lexical-node-type="base-paragraph"]')
					);
				})
				.flat()
				.map((el) => {
					return findTextNodes(el);
				})
				.flat();

			console.log('翻译文本：', texts.length, '段');

			// for (const node of texts) {
			// 	if (!this.cfg.translate) break;
			// 	if (!node.textContent?.trim()) continue;
			// 	const res = await translate(cloudApis, node.textContent || '');
			// 	if (!this.cfg.translate) break;
			// 	if (!res.data || !res.data?.result?.trim()) continue;
			// 	console.log(node.textContent, '=>', res.data?.result?.trim());
			// 	node.textContent = res.data?.result?.trim() || node.textContent;
			// 	node.parentElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
			// 	await $.sleep(100);
			// }
		});

		await waitForElement('.editor');

		// const result = await remotePage.waitForResponse('studentContent.json');
		async function loadVtt() {
			const medias = await getPageMediasByElement();
			// 找到视频
			for (const media of medias) {
				if (media.type === 'insert-video') {
					const result = await getSubtitlesFromMedia(media);
					const vtt = parseVTT(result, 1000);

					console.log({
						el: media.element,
						name: media.mediaFile.mediaName,
						fileName: media.mediaFile.fileName,
						vtt,
						text: vtt
							.map((l) => l.text)
							.map((t) => t.trim())
							.join('\n')
					});
				}
			}
		}
		loadVtt();
		$gm.unsafeWindow.loadVtt = loadVtt;
	},
	onrender(elements) {
		const translateBtn = h(
			'button',
			{
				className: 'base-style-button',
				style: { marginBottom: '10px' }
			},
			'🌐 整页翻译'
		);
		translateBtn.onclick = () => {
			this.cfg.translate = !this.cfg.translate;
			if (!this.cfg.translate) {
				translateBtn.textContent = '🌐 整页翻译';
			} else {
				translateBtn.textContent = '🌐 翻译中...（点击暂停）';
			}
		};
		elements.panel.body?.replaceWith(h('div', { className: 'card' }, [translateBtn]));
	}
});

function findTextNodes(node: Node) {
	const textNodes: Node[] = [];
	function recurse(n: Node) {
		if (n.nodeType === Node.TEXT_NODE) {
			textNodes.push(n);
		} else {
			n.childNodes.forEach(recurse);
		}
	}
	recurse(node);
	return textNodes;
}

function deepFinds(obj: any, finder: (obj: any) => boolean): any {
	const results = [];
	if (finder(obj)) {
		results.push(obj);
	}
	if (typeof obj === 'object' && obj !== null) {
		for (const key of Object.keys(obj)) {
			results.push(...deepFinds(obj[key], finder));
		}
	}
	return results;
}

/**
 * （后期反作弊升级后推荐使用）
 * 使用截获的网络数据获取页面的多媒体资源
 * @param remotePage
 */
async function getPageMediasByHack(remotePage: RemotePage) {
	const result = await remotePage.waitForResponse('studentContent.json');
	const medias: UnipusMedia[] = deepFinds(result, (obj) => !!obj?.mediaFile);
	return medias;
}

/**
 * 使用元素属性获取页面的多媒体资源
 * @param remotePage
 */
async function getPageMediasByElement() {
	const els = Array.from(
		document.querySelectorAll<HTMLElement>(
			'[data-lexical-node-type="insert-video"],[data-lexical-node-type="insert-audio"],[data-lexical-node-type="insert-image"]'
		)
	);

	const medias: UnipusMedia[] = [];

	for (const el of els) {
		const dataset = el.dataset;
		const type = dataset.lexicalNodeType as 'insert-video' | 'insert-audio' | 'insert-image';
		let media: UnipusMedia['mediaFile'] | null = null;
		if (type === 'insert-video') {
			const subtitle = dataset.subtitleArray ? JSON.parse(dataset.subtitleArray) : [];
			media = {
				coverImage: dataset.coverImage || '',
				duration: dataset.mediaDuration ? Number(dataset.mediaDuration) : undefined,
				fileUrl: dataset.videoUrl || '',
				videoSubtitleFile: subtitle,
				fileName: subtitle[0]?.fileName || '',
				mediaName: dataset.title || ''
			};
		} else if (type === 'insert-audio') {
			media = {
				duration: dataset.mediaDuration ? Number(dataset.mediaDuration) : undefined,
				fileUrl: el.querySelector('audio')?.src || ''
			};
		} else if (type === 'insert-image') {
			media = {
				fileUrl: el.querySelector('img')?.src || ''
			};
		}

		if (media) {
			medias.push({
				element: el,
				mediaFile: media,
				type: type
			});
		}
	}

	return medias;
}

function work(cfg: typeof UnipusIpublishScript.cfg, opts: CommonWorkOptions) {
	const els = Array.from(
		document.querySelectorAll<HTMLElement>(
			Object.values(supported_question_types)
				.map((t) => `[data-ipublish-question-group-type="${t}"]`)
				.join(',')
		)
	);

	for (const el of els) {
		const dataset = el.dataset;
		const type = dataset.ipublishQuestionGroupType as keyof typeof supported_question_types;
		if (!type) continue;
		el.scrollIntoView({ behavior: 'smooth', block: 'center' });
		$message.info(`即将开始做：${type}`);

		if (type === 'discussion_group') {
			if (cfg.discussion_mode === 'manually') {
				$message.warn('讨论题已跳过，请稍后自行手动完成');
				continue;
			}

			if (cfg.discussion_mode === 'copy') {
				// 随机复制其他讨论
			}
		}
	}
}

async function getSubtitlesFromMedia(media: UnipusMedia) {
	let result = '';
	for (const info of media.mediaFile.videoSubtitleFile || []) {
		if (info.fileType === 'text/vtt') {
			const res = await request(info.fileUrl, {
				responseType: 'text',
				type: 'fetch'
			});
			result += res + '\n';
		}
	}
	return result;
}

export function parseVTT(content = '', tolerance = 0) {
	const lines = content.split(/\r?\n/);
	const cues = [];
	let cue = null;
	const timePattern = /^(\d{2}:\d{2}(?::\d{2})?\.\d{3})\s-->\s(\d{2}:\d{2}(?::\d{2})?\.\d{3})$/;
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		const match = line.match(timePattern);
		if (match) {
			if (cue) {
				cues.push({ ...cue, text: cue.text.trim() });
			}
			cue = {
				start: toSeconds(match[1]),
				end: toSeconds(match[2]),
				text: ''
			};
		} else if (cue) {
			// 跳过数字行
			if (/^\n\d+$/.test(line)) {
				continue;
			}
			cue.text += (cue.text ? '\n' : '') + line;
		}
	}
	if (cue) {
		cues.push({ ...cue, text: cue.text.trim() });
	}

	// 合并重叠的 cues，允许 tolerance 容差
	const merged = [];
	for (const current of cues) {
		const last = merged[merged.length - 1];
		if (last && current.start < last.end - tolerance) {
			last.end = Math.max(last.end, current.end);
			last.text += '\n' + current.text;
		} else {
			merged.push({ ...current });
		}
	}
	return merged;
}

function toSeconds(timeStr: string) {
	if (!timeStr || typeof timeStr !== 'string') return 0;
	const parts = timeStr.split(':'); // e.g. ['00', '09.600'] or ['00', '00', '09.600']
	let hours = 0;
	let minutes = 0;
	let seconds = 0;

	if (parts.length === 3) {
		[hours, minutes] = parts.map(Number);
		const [s, ms = '0'] = parts[2].split('.');
		seconds = Number(s) + Number(ms) / 1000;
	} else if (parts.length === 2) {
		[minutes] = parts.map(Number);
		const [s, ms = '0'] = parts[1].split('.');
		seconds = Number(s) + Number(ms) / 1000;
	} else {
		return 0; // invalid format
	}

	return hours * 3600 + minutes * 60 + seconds;
}

function findQuestionBlockPreviousContent(questionBlock: HTMLElement) {
	let prev = questionBlock.previousElementSibling as HTMLElement | null;

	while (prev) {
		const ctx = prev.querySelector(
			'[data-lexical-node-type="insert-video"], [data-lexical-node-type="insert-audio"], [data-lexical-node-type="insert-image"]'
		);
		if (ctx) {
			return ctx;
		}
		prev = prev.previousElementSibling as HTMLElement | null;
	}
}
