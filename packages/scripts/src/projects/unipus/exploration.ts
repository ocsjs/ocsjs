import { $, Script, $message, $el, $$el, h, MessageElement, $ui } from 'easy-us';
import { CommonProject } from '../common';
import { waitForElement, waitForMedia } from '../../utils/study';
import { dropdownStyle, playbackRate, volume } from '../../utils/configs';
import { CommonWorkOptions, $msg, playMedia } from '../../utils';
import {
	defaultAnswerWrapperHandler,
	createDefaultQuestionResolver,
	RemotePage,
	QuestionTypes,
	WorkResult,
	OCSWorker,
	WorkOptions,
	WorkContext
} from '@ocsjs/core';
import { BackgroundProject } from '../background';
import { $playwright } from '../../utils/app';
import { answerWrapperEmptyWarning, simplifyWorkResult } from '../../utils/work';

const state = {
	current_media: null as HTMLMediaElement | null,
	starting: true
};

export const UnipusExplorationScript = new Script({
	name: '🖥️ 经典AI版-课程学习',
	namespace: 'unipus.exploration.study',
	matches: [
		['经典AI学习页面', 'unipus.cn/_explorationpc_default/pc.html'],
		['课程列表', 'unipus.cn/app/cmgt/resource-detail']
	],
	configs: {
		notes: {
			defaultValue: $ui.notes([
				'如果脚本错乱请刷新界面',
				['如想选其他章节重新开始，请选择后刷新页面让脚本重新运行'],
				'上传视频、录音等任务请自行完成'
			]).outerHTML
		},

		switchMode: {
			label: '切换模式',
			tag: 'select',
			options: [
				['auto', '自动切换下一章'],
				['manual', '手动跳转']
			],
			defaultValue: 'auto' as 'auto' | 'manual'
		},
		playbackRate: playbackRate,
		audioPlaybackRate: {
			label: '音频倍速',
			attrs: { title: '最高1.2倍' },
			tag: 'select',
			options: [0.8, 1, 1.2].map((rate) => [rate.toString(), rate + ' x']),
			defaultValue: 1
		},
		volume: volume,
		readTranslate: {
			label: '精读任务显示翻译',
			attrs: { type: 'checkbox' },
			defaultValue: true
		},
		enables: {
			...dropdownStyle,
			label: '任务开关',
			attrs: { type: 'checkbox' },
			defaultValue: true
		},
		enable_media: {
			label: '视频/音频任务',
			showIf: 'unipus.exploration.study.enables',
			elementClassName: 'config-details',
			defaultValue: true,
			attrs: { type: 'checkbox' }
		},
		enable_choice: {
			label: '选择题',
			showIf: 'unipus.exploration.study.enables',
			elementClassName: 'config-details',
			defaultValue: true,
			attrs: { type: 'checkbox' }
		},
		enable_banked_cloze: {
			label: '选词填空题',
			showIf: 'unipus.exploration.study.enables',
			elementClassName: 'config-details',
			defaultValue: true,
			attrs: { type: 'checkbox', title: '包含选词填空和下拉框选词填空' }
		},
		enable_reading: {
			label: '阅读理解题',
			showIf: 'unipus.exploration.study.enables',
			elementClassName: 'config-details',
			defaultValue: true,
			attrs: { type: 'checkbox' }
		},
		enable_completion: {
			label: '填空、翻译题',
			showIf: 'unipus.exploration.study.enables',
			elementClassName: 'config-details',
			defaultValue: true,
			attrs: { type: 'checkbox' }
		},
		enable_line_matching: {
			label: '连线配对题',
			showIf: 'unipus.exploration.study.enables',
			elementClassName: 'config-details',
			defaultValue: true,
			attrs: { type: 'checkbox' }
		},
		enable_ppt: {
			label: '翻页PPT任务',
			showIf: 'unipus.exploration.study.enables',
			elementClassName: 'config-details',
			defaultValue: true,
			attrs: { type: 'checkbox' }
		}
	},
	async oncomplete() {
		if (location.href.includes('cmgt/resource-detail')) {
			$msg.info('请打开任意课程的章节进行自动学习');
			return;
		}

		CommonProject.scripts.render.methods.pin(this);

		// 检查是否为软件环境
		const rp: RemotePage | undefined = await BackgroundProject.scripts.dev.methods.getRemotePlaywrightCurrentPage();
		// 检查是否为软件环境
		if (!rp) {
			return $playwright.showError();
		}

		this.onConfigChange('playbackRate', (value) => {
			if (state.current_media) {
				state.current_media.playbackRate = value;
			}
		});
		this.onConfigChange('volume', (value) => {
			if (state.current_media) {
				state.current_media.volume = value;
			}
		});

		// 等待确认弹窗出现自动关闭
		const checkConfirmModal = async () => {
			await $.sleep(3000);

			const btns = [
				// 系统学习时间确认
				'.system-info-cloud-ok-button',
				// 确认做笔记习惯弹窗
				'.ant-modal-body .ant-btn-primary',
				// 由于你长时间未操作，请点确定继续使用。
				'button[class*=mask_notice]'
			];

			const btn = await waitForElement(btns.join(','));
			if (btn) {
				await rp.click(btn);
			}
			await checkConfirmModal();
		};
		checkConfirmModal();
		await waitForElement('.question-wrap');
		job(this.cfg, rp);
	},
	onrender(elements) {
		const translateBtn = h(
			'button',
			{
				className: 'base-style-button',
				style: { marginBottom: '10px' }
			},
			'▶️ 开始学习'
		);
		translateBtn.onclick = () => {
			state.starting = !state.starting;
			if (!state.starting) {
				translateBtn.textContent = '▶️ 开始学习';
			} else {
				translateBtn.textContent = '🌐 学习中...（点击暂停）';
			}
		};
		elements.panel.body?.replaceWith(h('div', { className: 'card' }, [translateBtn]));
	},
	async onstart() {
		console.log(1);
	}
});

async function job(cfg: typeof UnipusExplorationScript.cfg, rp: RemotePage) {
	const wrap = await waitForElement('.question-wrap', { check_period_ms: 3000 });
	const wrap_content = wrap?.childNodes[0] as HTMLElement;
	const canRun = () => !!wrap_content?.isConnected;
	await waitFor(() => state.starting);

	const matches = (...selectors: string[]) => {
		return selectors.every((selector) => {
			return !!document.querySelector(selector);
		});
	};

	await (async () => {
		if (!wrap_content) {
			$msg.error('未找到任务内容区域，跳过该任务');
			return;
		}

		if (matches('.unipus-upload-container')) {
			$msg.info('检测到上传任务，请自行手动完成，即将跳过');
			return;
		}

		if (matches('.question-wrap [class*=bgimg] [class*=picture]')) {
			$msg.info('检测到图片任务，即将跳过');
			return;
		}

		// 不支持图片题
		if (matches('.layout-material-container .component-htmlview img')) {
			$msg.error('检测到题目中包含图片，暂时无法处理，即将跳过该任务');
			return;
		}

		if (matches('.question-wrap .video-box')) {
			$msg.info('检测到视频任务，即将播放');
			const media = await waitForMedia();
			if (!media) {
				$msg.error('未找到视频，即将跳过该任务');
				return;
			}
			if (!cfg.enable_media) {
				$msg.warn('视频/音频任务已关闭，即将跳过该任务');
				return;
			}

			media.currentTime = 0;
			media.volume = cfg.volume;
			media.playbackRate = cfg.playbackRate;
			return await new Promise<void>((resolve, reject) => {
				playMedia(() => media.play())
					.then(() => {
						state.current_media = media;
						media.volume = cfg.volume;
						media.playbackRate = cfg.playbackRate;
						media.addEventListener('pause', async () => {
							if (!canRun()) return;
							// 视频弹窗检测
							$msg.info('视频已暂停，继续播放中...');
							const el = $el('.popupBox .questionBox');
							if (el) {
								$msg.info('检测到视频弹窗，随机答题中...');
								await $.sleep(1000);
								const options = Array.from(el.querySelectorAll('div.option'));
								const randomIndex = Math.floor(Math.random() * options.length);
								await rp.click(options[randomIndex]);
							}

							setTimeout(() => {
								media.volume = cfg.volume;
								media.playbackRate = cfg.playbackRate;
								media.play();
							}, 1000);
						});
						media.addEventListener('ended', () => {
							if (!canRun()) return;
							$msg.success('视频播放完成，即将进入下一个任务');
							setTimeout(resolve, 3000);
						});
					})
					.catch(reject);
			});
		}

		// ===============================  精读内容 ===============================
		if (matches('.question-wrap .question-rich-text-read')) {
			$msg.info('检测到阅读任务，即将播放');

			const media = await waitForMedia({ timeout: 10000 });
			if (!media) {
				$msg.error('未找到阅读音频，即将跳过该任务');
				return;
			}
			if (!cfg.enable_media) {
				$msg.warn('视频/音频任务已关闭，即将跳过该任务');
				return;
			}

			if (cfg.readTranslate) {
				const btn = $el('.audioBox .btn-switch.close');
				if (btn) {
					await rp.click(btn);
				}
				// 翻译按钮
				const btns = $$el('div.audioBox .control-block.open');
				const translateBtn = btns[1]?.querySelectorAll('.btn-text')[0];
				if (translateBtn) {
					await rp.click(translateBtn);
				}
			}

			media.currentTime = 0;
			media.volume = cfg.volume;
			media.playbackRate = cfg.audioPlaybackRate;
			return await new Promise<void>((resolve, reject) => {
				playMedia(() => media.play())
					.then(() => {
						state.current_media = media;
						media.addEventListener('pause', async () => {
							if (!canRun()) return;
							$msg.info('音频已暂停，继续播放中...');
							setTimeout(() => media.play(), 1000);
						});
						media.addEventListener('ended', () => {
							if (!canRun()) return;
							$msg.success('阅读音频播放完成，即将进入下一个任务');
							setTimeout(resolve, 3000);
						});
					})
					.catch(reject);
			});
		}

		// =============================== 词汇PPT ===============================
		if (matches('.vocabulary-wrapper', '.swiper-slide')) {
			if (!cfg.enable_ppt) {
				$msg.warn('翻页PPT任务已关闭，即将跳过该任务');
				return;
			}

			$msg.info('检测到词汇PPT任务，即将开始学习');
			const countStr = ($el('.vocabulary-wrapper .ratio')?.innerText.trim() || '').split('/')[1] || '0';
			const totalCount = parseInt(countStr);
			let index = 0;
			let el = $el('.vocActions .action.next:not(.disabled)');
			while (el) {
				await rp.click(el);
				await $.sleep(1000);
				el = $el('.vocActions .action.next:not(.disabled)');

				index++;
				if (index >= totalCount) {
					break;
				}
			}
			return;
		}

		// ===============================  自检题 ===============================
		if (matches('[data-row-key="Review & check"]')) {
			$msg.info('检测到自检任务，即将开始填写');

			const got_its = $$el('.ant-table-cell .anticon-border');
			const reviews = $$el('.ant-table-cell .anticon-file-done');

			for (const got_it of got_its) {
				await rp.click(got_it);
				await $.sleep(500);
			}

			for (const review of reviews) {
				await rp.click(review);
				// 已掌握
				await rp.click('.modal-ok-btn');
				await $.sleep(500);
			}

			return;
		}

		// ===============================  阅读理解填空题 ===============================
		if (
			matches(
				// 左侧阅读理解
				'.layout-material-container',
				// 右侧回复区域
				'.layout-reply-container',
				'textarea'
			)
		) {
			if (!cfg.enable_reading) {
				$msg.warn('阅读理解题任务开关已关闭，即将跳过该任务');
				return;
			}
			// 判断已经完成
			if (checkUniTestIsDone()) {
				$msg.success('阅读理解填空题任务已完成，即将跳过该任务');
				return;
			}
			$msg.info('检测到阅读理解填空题任务，即将开始答题');

			await doUnderstandingText(rp, CommonProject.scripts.settings.methods.getWorkOptions());
			return;
		}

		// =============================== 阅读理解选择题 ===============================
		if (
			matches(
				// 左侧阅读理解
				'.layout-material-container',
				// 右侧回复区域
				'.layout-reply-container',
				'.option-wrap'
			)
		) {
			if (!cfg.enable_reading) {
				$msg.warn('阅读理解题任务开关已关闭，即将跳过该任务');
				return;
			}
			// 判断已经完成
			if (checkUniTestIsDone()) {
				$msg.success('阅读理解选择题任务已完成，即将跳过该任务');
				return;
			}
			$msg.info('检测到阅读理解选择题任务，即将开始答题');

			await doReading(rp, CommonProject.scripts.settings.methods.getWorkOptions());
			return;
		}

		// ===============================  普通选择题，需要在阅读理解下面判断，因为只是没有左侧区域，其他内容类似 ===============================
		if (matches('.layout-reply-container', '.option-wrap')) {
			if (!cfg.enable_choice) {
				$msg.warn('选择题任务开关已关闭，即将跳过该任务');
				return;
			}
			// 判断已经完成
			if (checkUniTestIsDone()) {
				$msg.success('选择题任务已完成，即将跳过该任务');
				return;
			}
			$msg.info('检测到选择题任务，即将开始答题');
			await doChoice(rp, CommonProject.scripts.settings.methods.getWorkOptions());
			return;
		}

		// =============================== 普通填空题，翻译题 ===============================
		if (matches('.layout-reply-container', '.full', 'textarea')) {
			if (!cfg.enable_completion) {
				$msg.warn('填空题任务开关已关闭，即将跳过该任务');
				return;
			}
			// 判断已经完成
			if (checkUniTestIsDone()) {
				$msg.success('填空题任务已完成，即将跳过该任务');
				return;
			}

			$msg.info('检测到填空题任务，即将开始答题');
			await doCompletion(rp, CommonProject.scripts.settings.methods.getWorkOptions());
			return;
		}

		// =============================== 选词填空 ===============================
		if (
			matches(
				// 选词填空按钮
				'.question-material-banked-cloze-reply',
				// 填空横线
				'.input-wrapper'
			)
		) {
			if (!cfg.enable_banked_cloze) {
				$msg.warn('选词填空任务开关已关闭，即将跳过该任务');
				return;
			}
			// 判断已经完成
			if (checkUniTestIsDone()) {
				$msg.success('选词填空任务已完成，即将跳过该任务');
				return;
			}
			$msg.info('检测到选词填空任务，即将开始答题');

			const direction = $el('.abs-direction')?.innerText.trim() || '';

			const blanks = $$el('.question-material-banked-cloze-reply .option-wrapper')
				.map((el) => el.querySelector('.option') || el.querySelector('.option-placeholder'))
				.map((el) => el?.textContent || '')
				.join('\n');

			const questions = resoleInputWrapLines($el('.question-material-banked-cloze-scoop') as HTMLElement);

			if (!blanks.trim()) {
				$msg.error('未找到题目内容，跳过该任务');
				return;
			}

			try {
				const res = await singleQuestionHandle({
					rp,
					question: [direction, '-'.repeat(10), blanks, '-'.repeat(10), questions].join('\n'),
					type: 'completion',
					options: $$el('.question-wrap .input-wrapper input'),
					handler: async (type, answer, option) => {
						const input = option as HTMLInputElement;
						if (input.value) {
							return;
						}
						await rp.click(input);
						await rp['keyboard.type'](answer, { delay: 20 });
						await $.sleep(200);
					}
				});

				if (res.finish) {
					$msg.success('选词填空任务答题完成');
				} else {
					$msg.error('选词填空任务未完成，可能是答案不匹配');
				}
			} catch (err) {
				$msg.error((err as Error).message || '选词填空任务答题出错，跳过该任务');
			}
			return;
		}

		// =============================== 下拉框选词填空 ===============================
		if (
			matches(
				// 下拉框选词填空
				'.input-wrapper .ant-dropdown-trigger'
			)
		) {
			if (!cfg.enable_banked_cloze) {
				$msg.warn('选词填空任务开关已关闭，即将跳过该任务');
				return;
			}
			// 判断已经完成
			if (checkUniTestIsDone()) {
				$msg.success('选词填空任务已完成，即将跳过该任务');
				return;
			}
			$msg.info('检测到选词填空任务，即将开始答题');

			// 将下拉框文本前方的 1) 2) 换成空格，避免影响匹配
			const ques = ($el('.question-wrap')?.innerText.trim() || '')
				.replace(/\s\d+\)点击选择/g, ' _____ ')
				// 已经选择了的选项
				.replace(/\s\d+\)\n+[a-zA-Z]+\n+/g, ' _____ ');

			if (!ques.trim()) {
				$msg.error('未找到题目内容，跳过该任务');
				return;
			}

			const options = $$el('.scoop-select-wrapper i').map((e) => e.textContent);

			try {
				const res = await singleQuestionHandle({
					rp,
					question: [ques, '-'.repeat(10), ...options].join('\n'),
					type: 'completion',
					options: $$el('.scoop-select-wrapper'),
					handler: async (type, answer, option) => {
						await rp.click(option);
						await $.sleep(200);
						const target = Array.from(option.querySelectorAll('.ant-dropdown-menu-item')).find(
							(el) => el.textContent?.trim() === answer.trim()
						);
						if (target) {
							await rp.click(target);
						}
						await $.sleep(200);
					}
				});

				if (res.finish) {
					$msg.success('选词填空任务答题完成');
				} else {
					$msg.error('选词填空任务未完成，可能是答案不匹配');
				}
			} catch (err) {
				$msg.error((err as Error).message || '选词填空任务答题出错，跳过该任务');
			}
			return;
		}

		// =============================== 自由填空题 ===============================
		// 例如：单个阅读理解下的表格填写题
		if (
			matches(
				'.layout-reply-container',
				// 填空横线
				'.fe-scoop .scoop-input-wrapper',
				'input'
			)
		) {
			if (!cfg.enable_completion) {
				$msg.warn('自由填空题任务开关已关闭，即将跳过该任务');
				return;
			}
			// 判断已经完成
			if (checkUniTestIsDone()) {
				$msg.success('自由填空题任务已完成，即将跳过该任务');
				return;
			}
			$msg.info('检测到自由填空题任务，即将开始答题');

			const direction = $el('.abs-direction')?.innerText.trim() || '';

			const text_context = $el('.layout-material-container')?.innerText.trim() || '';

			const questions = resoleInputWrapLines($el('.layout-reply-container ') as HTMLElement);

			if (!questions.trim()) {
				$msg.error('未找到题目内容，跳过该任务');
				return;
			}

			try {
				const res = await singleQuestionHandle({
					rp,
					question: [
						direction,
						'-'.repeat(10),
						...(text_context ? [text_context, '-'.repeat(10)] : []),
						questions
					].join('\n'),
					type: 'completion',
					// 支持单列和双列的自由填空题
					options: $$el('.layout-reply-container .fe-scoop input'),
					handler: async (type, answer, option) => {
						const input = option as HTMLInputElement;
						if (input.value) {
							return;
						}
						await rp.click(input);
						await rp['keyboard.type'](answer, { delay: 20 });
						await $.sleep(200);
					}
				});

				if (res.finish) {
					$msg.success('自由填空题任务答题完成');
				} else {
					$msg.error('自由填空题任务未完成，可能是答案不匹配');
				}
			} catch (err) {
				$msg.error((err as Error).message || '自由填空题任务答题出错，跳过该任务');
			}

			return;
		}

		// =============================== 连线配对题 ===============================
		if (matches('.sequence-reply-view-item-text')) {
			if (!cfg.enable_line_matching) {
				$msg.warn('连线配对任务开关已关闭，即将跳过该任务');
				return;
			}
			// 判断已经完成
			if (checkUniTestIsDone()) {
				$msg.success('连线配对题任务已完成，即将跳过该任务');
				return;
			}
			$msg.info('检测到连线配对题任务，即将开始答题');

			const moveOption = async (opt: HTMLElement) => {
				opt.setAttribute('testid', 'to-move');
				opt.scrollIntoView({ block: 'center', behavior: 'smooth' });
				await rp.hover('[testid="to-move"]');
				await rp['mouse.down']();
				// 移动选项到界面最上方，然后平台会自己排列到最上面
				await rp.hover('.abs-direction');
				await rp['mouse.up']();
				opt.removeAttribute('testid');
				await $.sleep(500);
			};

			try {
				const queryItems = () => $$el('.question-wrap .sequence-reply-view-item-text');

				$msg.warn('正在检测连线配对题顺序中...请勿操作');
				const checkOrder = async (skip_count = 0) => {
					// 如果发现选项乱序，先摆正顺序
					const options = queryItems();
					const option_data: { el: HTMLElement; index: number }[] = [];
					for (const opt of options) {
						const text = opt.innerText.trim();
						const match = text.match(/^([A-Z])\./);
						if (match) {
							option_data.push({ el: opt, index: match[1].charCodeAt(0) });
						}
					}
					// 检测顺序是否错误
					const is_ordered = option_data.every((data, i, arr) => {
						if (i === 0) return true;
						return data.index >= arr[i - 1].index;
					});
					if (is_ordered) {
						return;
					}
					// 排序，每次移动都会更新dom元素，这里移动一次直接返回 false，知道没有元素可以移动位置
					// 则代表已经全部排列完成
					const first = option_data.slice(skip_count).sort((a, b) => b.index - a.index)[0];
					if (!first) {
						return;
					}
					await moveOption(first.el);
					await checkOrder(skip_count + 1);
				};
				await checkOrder();
				$msg.info('连线配对题选项已排序完成，开始作答');

				const seq = $el('.sequence-view')?.innerText.trim() || '';
				const direction = $el('.abs-direction')?.innerText.trim() || '';
				if (!seq || !direction) {
					$msg.error('未找到题目内容，跳过该任务');
					return;
				}
				const texts = seq.match(/\d+.+\n/g)?.map((line) => line.trim()) || [];
				const options = seq.match(/\n[A-Z]\..+/g)?.map((line) => line.trim()) || [];

				const result_answers: string[] = [];

				const res = await singleQuestionHandle({
					rp,
					question: [direction, '-'.repeat(10), texts, '-'.repeat(10), options].flat().join('\n'),
					type: 'completion',
					options: queryItems(),
					// 手动执行提交操作
					custom_upload_handler: true,
					handler: async (type, answer, option) => {
						if (!answer.match(/^[A-Z]$/)) {
							throw new Error('答案格式不正确，无法作答连线配对题，跳过该任务');
						}
						result_answers.push(answer);
					}
				});

				const msg = $message.warn({ content: '移动顺序中...请勿操作', duration: result_answers.length * 1000 });
				// 因为答案顺序是从第一个开始的，所以需要倒序一个个移动到最上方，让平台自己排列
				for (const answer of result_answers.reverse()) {
					const items = queryItems();
					const index = items.findIndex((item) => {
						const text = item.innerText.trim();
						const match = text.match(/^([A-Z])\./);
						return match && match[1] === answer;
					});
					await moveOption(items[index]);
					await $.sleep(500);
				}
				msg?.remove();

				if (res.finish) {
					// 手动提交
					await submitAnswer(rp);
					$msg.success('连线配对题任务答题完成');
				} else {
					$msg.error('连线配对题任务未完成，可能是答案不匹配');
				}
			} catch (err) {
				$msg.error((err as Error).message || '自由填空题任务答题出错，跳过该任务');
			}
		}

		// =============================== 文本阅读题，这里等十秒跳过 ===============================
		if (matches('.text-material-wrapper')) {
			if ($$el('.text-material-wrapper .component-htmlview p').length === 1) {
				$msg.info('检测到文本阅读题任务，阅读10秒后跳过');
				await $.sleep(10 * 1000);
				return;
			}
		}

		$msg.info('未知任务类型，即将跳过');
	})();
	if (cfg.switchMode === 'manual') {
		const el = $message.warn({ content: '当前为手动切换模式，已暂停，请手动切换。', duration: 0 });
		await waitFor(() => !wrap_content.isConnected, { show_msg: false });
		el?.remove();
		await job(cfg, rp);
		return;
	}

	$msg.success('任务完成，即将进入下一个任务');
	await $.sleep(3 * 1000);
	await waitFor(() => state.starting);

	if (!(await next(rp))) {
		$msg.success('已完成所有任务');
		CommonProject.scripts.settings.methods.notificationBySetting('已完成所有任务', {
			duration: 0,
			extraTitle: UnipusExplorationScript.name
		});
		return;
	}
	await job(cfg, rp);
}

async function next(rp: RemotePage) {
	// 小任务
	const tasks = $$el('.pc-header-tasks-row .pc-task');
	for (let index = 0; index < tasks.length; index++) {
		const task = tasks[index];
		if (task.classList.contains('pc-header-task-activity')) {
			const nextTask = tasks[index + 1];
			if (nextTask) {
				await rp.click(nextTask);
				// nextTask.click();
				return true;
			}
		}
	}
	// 小章节
	const tabs = $$el('.pc-tab-row .tab');
	for (let index = 0; index < tabs.length; index++) {
		const tab = tabs[index];
		if (tab.classList.contains('pc-header-tab-activity')) {
			const nextTab = tabs[index + 1];
			if (nextTab) {
				await rp.click(nextTab);
				// nextTab.click();
				return true;
			}
		}
	}

	// 大章节，好像有两个UI版本
	const elements = $$el('.pc-slider-content [data-role="micro"],.pc-slider-content [data-role="node"]');
	for (let index = 0; index < elements.length; index++) {
		const element = elements[index];
		if (element.classList.contains('pc-menu-activity')) {
			const nextElement = elements[index + 1];
			if (nextElement) {
				await rp.click(nextElement);
				// nextElement.click();
				return true;
			}
		}
	}

	return false;
}

// function getCurrentTaskName() {
// 	return $el('.pc-header-tasks-row .pc-header-task-activity')?.textContent.trim() || '';
// }

// function getCurrentTabName() {
// 	return $el('.pc-tab-row .pc-header-tab-activity')?.textContent.trim() || '';
// }

function waitFor(condition: () => boolean, opts: { show_msg: boolean } = { show_msg: true }) {
	let msg: MessageElement | undefined;
	return new Promise<void>((resolve) => {
		const interval = setInterval(() => {
			if (condition()) {
				msg?.remove();
				clearInterval(interval);
				resolve();
			} else {
				if (!msg && opts.show_msg) {
					msg = $message.info({ content: '学习已暂停，点击开始按钮继续学习', duration: 0 });
				}
			}
		}, 1000);
	});
}

/**
 * 适用于单次题型的答题处理
 */
async function singleQuestionHandle({
	rp,
	question,
	type,
	options,
	handler,
	custom_upload_handler = false
}: {
	rp: RemotePage;
	question: string;
	type: QuestionTypes;
	options: HTMLElement[];
	handler: (type: QuestionTypes, answer: string, option: HTMLElement) => any;
	custom_upload_handler?: boolean;
}) {
	if (!type) throw new Error('未识别题目类型，无法作答');

	const { answererWrappers, answerSeparators } = CommonProject.scripts.settings.methods.getWorkOptions();

	if (answererWrappers === undefined || answererWrappers.length === 0) {
		await answerWrapperEmptyWarning(0);
		return { finish: false };
	}

	const visual_state = CommonProject.scripts.render.cfg.visual;
	// 最大化面板
	CommonProject.scripts.render.methods.normal();
	CommonProject.scripts.workResults.methods.init();
	// 固定显示答题结果面板
	CommonProject.scripts.render.methods.pin(CommonProject.scripts.workResults);
	console.log('question', question);

	// ====================== 搜题 ======================
	const searchedInfos = await CommonProject.scripts.apps.methods.searchAnswerInCaches(question, async () => {
		return defaultAnswerWrapperHandler(answererWrappers, {
			type: type,
			title: question
		});
	});

	if (!searchedInfos || searchedInfos.length === 0) {
		throw new Error('未搜到到任何答案。');
	}

	const ctx: WorkContext<any> = {
		searchInfos: searchedInfos,
		answerSeparators: answerSeparators.split(','),
		type: type,
		root: document.body,
		elements: {}
	};

	// ====================== 显示搜题结果 ======================
	const workResults: WorkResult<any>[] = [
		{
			ctx,
			requested: true,
			resolved: false
		}
	];
	const update = () => {
		CommonProject.scripts.workResults.methods.setResults(simplifyWorkResult(workResults, () => question));
		CommonProject.scripts.workResults.methods.updateWorkStateByResults(workResults);
	};
	update();

	const action = type === 'completion' ? '填写' : '选择';
	const msg = $message.warn({ content: `正在${action}答案中...请勿操作`, duration: 0 });
	// ====================== 答案答题自动处理程序 ======================
	const resolver = createDefaultQuestionResolver(ctx);
	const result = await resolver[type](searchedInfos, options, handler);
	msg?.remove();

	// ====================== 显示答题结果 ======================
	workResults[0].resolved = true;
	workResults[0].result = result;
	if (result?.finish) {
		CommonProject.scripts.apps.methods.addQuestionCacheFromWorkResult(
			simplifyWorkResult([workResults[0]], () => question)
		);
	}
	update();

	// ====================== 还原尺寸状态 ======================
	if (visual_state === 'minimize' && CommonProject.scripts.render.cfg.visual !== 'minimize') {
		CommonProject.scripts.render.methods.minimize();
	}

	const { upload } = CommonProject.scripts.settings.methods.getWorkOptions();
	if (result.finish) {
		// 提交
		if (upload !== 'nomove') {
			if (!custom_upload_handler) {
				await submitAnswer(rp);
			}
			return { upload: !custom_upload_handler, finish: true };
		} else {
			return { upload: false, finish: true };
		}
	} else {
		return { upload: false, finish: false };
	}
}

function doChoice(rp: RemotePage, opts: CommonWorkOptions) {
	const is_multiple = !!$el('.multipleChoice');
	return handleCommonUnitTest(rp, opts, {
		type: is_multiple ? 'multiple' : 'single',
		test_type: 'choice',
		root: '.question-common-abs-choice',
		elements: {
			title: '.ques-title',
			options: '.option-wrap .option .content'
		}
	});
}

function doReading(rp: RemotePage, opts: CommonWorkOptions) {
	const is_multiple = !!$el('.multipleChoice');
	return handleCommonUnitTest(rp, opts, {
		type: is_multiple ? 'multiple' : 'single',
		test_type: 'reading-choice',
		root: '.question-common-abs-choice',
		elements: {
			// 将题目和选项一起搜索
			title: '.ques-title,.option-wrap',
			options: '.option-wrap .option .content'
		},
		questionTitleTransform(ques) {
			// 指导内容，比如说：选择最佳匹配的选项...
			const direction = $el('.question-wrap .abs-direction')?.innerText.trim() || '';
			// 阅读理解主要内容
			const ctx = $el('.question-wrap .question-common-abs-material')?.innerText.trim() || '';
			// ques 就是小标题
			return [direction, '-'.repeat(10), ctx, '-'.repeat(10), ques].filter(Boolean).join('\n');
		}
	});
}

function doUnderstandingText(rp: RemotePage, opts: CommonWorkOptions) {
	return handleCommonUnitTest(rp, opts, {
		type: 'completion',
		test_type: 'reading-replay',
		root: '.question-common-abs-reply',
		elements: {
			// 将题目和选项一起搜索
			title: '.question-inputbox-header',
			options: 'textarea'
		},
		questionTitleTransform(ques) {
			// 指导内容，比如说：选择最佳匹配的选项...
			const direction = $el('.question-wrap .abs-direction')?.innerText.trim() || '';
			// 阅读理解主要内容
			const ctx = $el('.question-wrap .question-common-abs-material')?.innerText.trim() || '';
			// ques 就是小标题
			return [direction, '-'.repeat(10), ctx, '-'.repeat(10), ques].filter(Boolean).join('\n');
		}
	});
}

function doCompletion(rp: RemotePage, opts: CommonWorkOptions) {
	return handleCommonUnitTest(rp, opts, {
		type: 'completion',
		test_type: 'complete',
		root: '.question-common-abs-reply',
		elements: {
			title: '.question-inputbox-header',
			options: '.question-inputbox-body textarea'
		},
		questionTitleTransform(ques) {
			// 指导内容，比如说：选翻译以下内容成中文或者英文
			const direction = $el('.question-wrap .abs-direction')?.innerText.trim() || '';
			// ques 就是翻译内容
			return [direction, '-'.repeat(10), ques].filter(Boolean).join('\n');
		}
	});
}

async function handleCommonUnitTest(
	rp: RemotePage,
	opts: CommonWorkOptions,
	config: {
		type: QuestionTypes;
		root: string;
		elements: WorkOptions<any>['elements'];
		onUpload?: (uploadable: boolean) => any;
		questionTitleTransform?: (ques: string, result_transform?: boolean) => string;
		test_type: 'reading-choice' | 'reading-replay' | 'choice' | 'complete';
	}
) {
	if (opts.answererWrappers === undefined || opts.answererWrappers.length === 0) {
		return await answerWrapperEmptyWarning(0);
	}
	const visual_state = CommonProject.scripts.render.cfg.visual;
	// 最大化面板
	CommonProject.scripts.render.methods.normal();
	CommonProject.scripts.workResults.methods.init();
	// 固定显示答题结果面板
	CommonProject.scripts.render.methods.pin(CommonProject.scripts.workResults);

	const titleTransform = (titles: (HTMLElement | undefined)[]) => {
		const res = titles.map((t) => (t ? t.innerText : '')).join('\n\n');
		return config.questionTitleTransform ? config.questionTitleTransform(res) : res;
	};

	/** 新建答题器 */
	const worker = new OCSWorker({
		root: config.root,
		elements: {
			title: config.elements.title,
			options: config.elements.options
		},
		thread: opts.thread ?? 1,
		answerSeparators: opts.answerSeparators.split(',').map((s) => s.trim()),
		/** 默认搜题方法构造器 */
		answerer: async (elements, ctx) => {
			const title = titleTransform(elements.title);
			console.log('title', title);
			if (title.trim()) {
				return CommonProject.scripts.apps.methods.searchAnswerInCaches(title.trim(), async () => {
					await $.sleep((opts.period ?? 3) * 1000);
					return defaultAnswerWrapperHandler(opts.answererWrappers, {
						type: ctx.type,
						title,
						options: ctx.type === 'completion' ? '' : ctx.elements.options.map((o) => o.innerText).join('\n')
					});
				});
			} else {
				throw new Error('题目为空，请查看题目是否为空，或者忽略此题');
			}
		},

		work: {
			type(ctx) {
				return config.type;
			},
			async handler(type, answer, option, ctx) {
				if (type === 'judgement' || type === 'single' || type === 'multiple') {
					// 这里只用判断多选题是否选中，如果选中就不用再点击了，单选题是 radio，所以不用判断。
					const opt = option.parentElement as HTMLElement;
					if (opt.classList.contains('selected')) {
						return;
					}
					const btn = opt.querySelector('.caption');
					if (btn) {
						await rp.click(btn);
						await $.sleep(200);
					}
				} else if (type === 'completion') {
					const input = option as HTMLTextAreaElement;
					if (input.value) {
						return;
					}
					await rp.click(input);
					await rp['keyboard.type'](answer);
					await $.sleep(200);
				}
			}
		},

		/** 完成答题后 */
		async onResultsUpdate(curr, _, res) {
			/**
			 * 阅读理解题目格式化显示，否则会超长
			 */
			const readingResultTitleTransform = (t: any, index: number) => {
				const ctx = res[index].ctx;

				const body = [
					`<span title="${[titleTransform(ctx?.elements.title || [])]
						.join('\n')
						.replace(/"/g, '&quot;')
						.replace(/</g, '&lt;')
						.replace(/>/g, '&gt;')}">[阅读理解上下文]</span><br>`,
					...(config.test_type === 'reading-choice'
						? [
								...$$el('.ques-title', ctx?.root).map((e) => e.innerText.trim()),
								...$$el('.option-wrap .option .content', ctx?.root)
									.map((e) => e.innerText.trim())
									.map((o, i) => {
										const charCode = 65 + i;
										return `${String.fromCharCode(charCode)}. ${o}`;
									})
						  ]
						: []),
					...(config.test_type === 'reading-replay'
						? [...$$el('.question-inputbox-header', ctx?.root).map((e) => e.innerText.trim())]
						: [])
				];
				return body.filter(Boolean).join('<br>');
			};
			if (curr.result?.finish) {
				CommonProject.scripts.apps.methods.addQuestionCacheFromWorkResult(
					simplifyWorkResult(
						[curr],
						config.test_type === 'reading-choice' || config.test_type === 'reading-replay'
							? readingResultTitleTransform
							: titleTransform
					)
				);
			}
			CommonProject.scripts.workResults.methods.setResults(
				simplifyWorkResult(
					res,
					config.test_type === 'reading-choice' || config.test_type === 'reading-replay'
						? readingResultTitleTransform
						: titleTransform
				)
			);
			CommonProject.scripts.workResults.methods.updateWorkStateByResults(res);
		}
	});

	const results = await worker.doWork({ enable_debug: BackgroundProject.scripts.dev.cfg.enable_answerer_debug });
	// 停顿等待
	const msg = `答题完成，将等待 ${opts.stopSecondWhenFinish} 秒后进行保存或提交。`;
	$msg.info({ content: msg, duration: opts.stopSecondWhenFinish });
	await $.sleep(opts.stopSecondWhenFinish * 1000);
	// 处理提交
	await worker.uploadHandler({
		type: opts.upload,
		results,
		async callback(finishedRate, uploadable) {
			const msg = `完成率 ${finishedRate.toFixed(2)}% :  ${uploadable ? '3秒后将自动提交' : '3秒后将自动保存'} `;
			$msg.success({ content: msg, duration: 3 });

			await $.sleep(3000);

			if (config.onUpload) {
				await config.onUpload(uploadable);
			} else {
				if (uploadable) {
					await submitAnswer(rp);
				} else {
					// U校园选择了就会自动保存答案
				}
			}
		}
	});

	// 还原尺寸状态
	if (visual_state === 'minimize' && CommonProject.scripts.render.cfg.visual !== 'minimize') {
		CommonProject.scripts.render.methods.minimize();
	}

	worker.emit('done');
}

function checkUniTestIsDone() {
	// 判断已经完成
	if ($el('.question-common-course-page')?.innerText.includes('答题小结')) {
		return true;
	}
	return false;
}

// function waitForMessageContinue() {
// 	return new Promise<void>((resolve, reject) => {
// 		const button = h('button', { className: 'base-style-button' }, '继续学习');
// 		button.onclick = () => {
// 			msg?.remove();
// 			resolve();
// 		};
// 		const el = h('div', ['学习已暂停，点击开始按钮继续学习', button]);
// 		const msg = $message.info({ content: el, duration: 0 });
// 	});
// }

async function submitAnswer(rp: RemotePage) {
	// 部分 job 会有内置多个题目，此时会有多个按钮，上一题、下一题、提 交（中间有个空格）
	const btn = $$el('.question-common-course-page .btn').find((e) => {
		const btn = e.innerText.replace(/\s/g, '');
		return btn.includes('提交') || btn.includes('下一题');
	});
	if (btn) {
		await rp.click(btn);
	}

	//  等久点，可能存在AI判分
	await $.sleep(3000);
	// 可能出现的结果：答题小结、下一题
	await waitForElement('.summary-tab-container,.question-common-course-page .btn');
	// 这里不需要再点击了，外层会继续处理下一章跳转
}

/**
 * 解决选词填空、填空题等存在横线的题目，这里吧横线（innerText无法读取）替换成 _____ 以便搜题
 * @param root
 */
function resoleInputWrapLines(root: HTMLElement) {
	let temp_ques = '\n' + root?.innerText.trim() || '';
	if (temp_ques.match(/\s\d+\)/)) {
		// 如果有序号，则替换成空格，避免影响匹配
		temp_ques = temp_ques.replace(/\s(\d+)\)/g, ' ($1) _____ ');
	} else {
		const wrap = root.cloneNode(true) as HTMLElement;
		for (const input of Array.from(wrap.querySelectorAll('.fe-scoop'))) {
			input.replaceChildren(' _____ ');
		}
		document.body.appendChild(wrap);
		temp_ques = wrap.innerText.trim();
		document.body.removeChild(wrap);
	}
	return temp_ques;
}
