import debounce from 'lodash/debounce';
import {
	defaultAnswerWrapperHandler,
	AnswerWrapperParser,
	SimplifyWorkResult,
	WorkUploadType,
	AnswerWrapperHandlerConfig
} from '@ocsjs/core';
import { $message, h, $gm, $store, Project, Script, $modal, $ui, MessageElement, cors } from 'easy-us';
import type { AnswererWrapper } from '@ocsjs/core';
import { CXProject, ICourseProject, IcveMoocProject, YKTProject, ZHSProject, ZJYProject } from '../index';
import { BackgroundProject } from './background';
import { enableCopy } from '../utils';
import { SearchInfosElement } from '../elements/search.infos';
import { dropdownStyle } from '../utils/configs';
import {
	buildAnswererEnv,
	createAnswererWrappersSignature,
	isAnswererWrappersSupportImageOptimize
} from '../utils/work';
import { IMAGE_URL_REGEX } from '../utils/answerer-env';
import { getAnswererConfigProvider, openAnswererConnect, waitForAnswererConfig } from '../utils/answerer-connect';
import { confirmRiskyAnswerWrappers } from '../utils/answer-wrapper-security';
import { initEdgeMinimize } from '../utils/edge-minimize';
import {
	createAnswererWrapperSection,
	createSteps,
	createStatusBox,
	createHero,
	createAnswererModeDropdown,
	loadingSpinSvg
} from '../utils/ui';

const TAB_WORK_RESULTS_KEY = 'common.work-results.results';

/**
 * 搜题气泡文本处理：将题目中的图片 URL 替换为 [图片N] 占位符。
 * 图片题 URL 通常极长（几十到上百字符），直接放进消息气泡会撑破宽度且无可读性；
 * 编号按出现顺序分配，同 URL 复用同一编号（与 createImageSuggestion 的占位符规则保持一致）。
 * 非图片 URL 不替换，纯文字/公式文本透传。
 */
function formatQuestionForMessage(question: string): string {
	if (!question) return question;
	// 使用局部实例，避免共享正则（带 g 标志）的 lastIndex 状态互相干扰
	const re = new RegExp(IMAGE_URL_REGEX.source, IMAGE_URL_REGEX.flags);
	const placeholderMap = new Map<string, string>();
	let counter = 0;
	return question.replace(re, (url) => {
		let p = placeholderMap.get(url);
		if (!p) {
			counter++;
			p = `[图片${counter}]`;
			placeholderMap.set(url, p);
		}
		return p;
	});
}

export const CommonEvents = {
	emitAnswererChanged: cors.defineTopFunction((curr: AnswererWrapper[], pre: AnswererWrapper[]) => {
		CommonProject.scripts.settings.emit('answerer-wrapper-change', curr, pre);
	}),
	emitWorkerChanged: cors.defineTopFunction((result: SimplifyWorkResult) => {
		CommonProject.scripts.workResults.emit('work-current-result-change', result);
	}),
	/**
	 * worker 工作状态变化的唯一入口（commonWork 与各平台脚本在 worker 生命周期中调用）。
	 * 统一维护 isWorkerWorking（结果面板"清空搜索结果"按钮显隐的数据源）、
	 * 触发面板重渲染，并广播 work-state-change 事件（如搜题气泡）。
	 */
	emitWorkerStateChange: cors.defineTopFunction((workerState: 'done' | 'start' | 'stop' | 'close') => {
		state.workResult.isWorkerWorking = workerState === 'start';
		workerWorkingChangeListeners.forEach((listener) => listener());
		CommonProject.scripts.workResults.emit('work-state-change', workerState);
	})
};

/**
 * 从结果数组统计进度（搜索结果信息栏的唯一数据来源）。
 * 计数一律由结果数组派生，不单独存储，避免与结果数据不同步。
 */
const count = (results: SimplifyWorkResult[]) => ({
	total: results.length,
	requested: results.filter((r) => r.requested).length,
	resolved: results.filter((r) => r.resolved).length
});

/**
 * 答题完成（finish === true）的结果自动写入题库缓存。
 * 集成在 update/append 中，调用方无需再单独调用 addQuestionCacheFromWorkResult；
 * 重复写入由 addQuestionCache 按 题目+答案 去重。
 * 接入全局设置的题库缓存开关（与 searchAnswerInCaches 读取侧语义一致：仅显式关闭时跳过）。
 */
const cacheIfFinished = (result: SimplifyWorkResult) => {
	if (CommonProject.scripts.settings.cfg.enableQuestionCaches === false) {
		return;
	}
	if (result.finish === true) {
		BackgroundProject.scripts.data.methods.addQuestionCacheFromWorkResult([result]);
	}
};

/**
 * 题库启停状态接入（题库卡片组件回调，组件实现见 utils/ui.ts）
 * 停用后无法在自动答题中查询题目，恢复入口：通用-全局设置-题库配置
 */
const answererListHandlers = {
	isDisabled: (name: string) => CommonProject.scripts.settings.cfg.disabledAnswererWrapperNames.includes(name),
	onToggle: (name: string, disabled: boolean) => {
		if (disabled) {
			CommonProject.scripts.settings.cfg.disabledAnswererWrapperNames = [
				...CommonProject.scripts.settings.cfg.disabledAnswererWrapperNames,
				name
			];
			$message.warn({
				content: '题库：' + name + ' 已被停用，如需开启请在：通用-全局设置-题库配置中开启。',
				duration: 30
			});
		} else {
			CommonProject.scripts.settings.cfg.disabledAnswererWrapperNames =
				CommonProject.scripts.settings.cfg.disabledAnswererWrapperNames.filter((n) => n !== name);
			$message.success({
				content: '题库：' + name + ' 已启用。',
				duration: 3
			});
		}
	}
};

/** worker 工作状态变化监听器（结果面板创建时注册，状态变化时触发重渲染以更新清空按钮显隐） */
const workerWorkingChangeListeners = new Set<() => void>();

const state = {
	workResult: {
		/** 答题 worker 是否正在工作中（动态答题器的"清空搜索结果"按钮在工作时隐藏，结束时显示） */
		isWorkerWorking: false,
		/**
		 * 题目位置同步处理器
		 */
		questionPositionSyncHandler: {
			cx: (index: number) => {
				const el = document.querySelectorAll<HTMLElement>('[id*="sigleQuestionDiv"], .questionLi')?.item(index);
				if (el) {
					window.scrollTo({
						top: el.getBoundingClientRect().top + window.pageYOffset - 50,
						behavior: 'smooth'
					});
				}
			},
			'zhs-gxk': (index: number) => {
				document.querySelectorAll<HTMLElement>('.answerCard_list ul li').item(index)?.click();
			},
			'zhs-xnk': (index: number) => {
				document.querySelectorAll<HTMLElement>('.jobclassallnumber-div li[questionid]').item(index)?.click();
			},
			'zhs-smart': (index: number) => {
				document.querySelectorAll<HTMLElement>('[role="treeitem"] .font-sec-style-node').item(index)?.click();
			},
			'zhs-fusion': (index: number) => {
				document.querySelectorAll<HTMLElement>('.right-box .list .item').item(index)?.click();
			},
			'zhs-hike': (index: number) => {
				document.querySelectorAll<HTMLElement>('.q_main_right .card_ul .card_li').item(index)?.click();
			},
			icve: (index: number) => {
				document.querySelectorAll<HTMLElement>(`.sheet_nums [id*="sheetSeq"]`).item(index)?.click();
			},
			zjy: (index: number) => {
				document
					.querySelectorAll<HTMLElement>('.subjectDet')
					.item(index)
					?.scrollIntoView({ behavior: 'smooth', block: 'center' });
			},
			icourse: (index: number) => {
				document
					.querySelectorAll<HTMLElement>('.u-questionItem,[class*=questionBody]')
					.item(index)
					?.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		}
	},
	setting: {
		/** 图片题优化兼容性提示消息（可移除） */
		imageOptimizeMessage: undefined as MessageElement | undefined
	}
};

export const CommonProject = Project.create({
	name: '通用',
	domains: [],
	scripts: {
		guide: new Script({
			name: '🏠 使用教程',
			matches: [['所有页面', /.*/]],
			namespace: 'common.guide',
			configs: {
				notes: {
					defaultValue: $ui.notes([
						'打开任意网课平台，进入视频、作业页面等待脚本运行，',
						'⚠️ 禁止与其他脚本一起使用（不兼容），也不能开多个相同脚本',
						'⚠️ 禁止最小化浏览器、切屏，否则可能导致脚本无法运行！',
						'有疑问请访问下方交流群，进群后带截图进行反馈。'
					]).outerHTML
				}
			},
			onrender({ panel }) {
				const guide = createGuide();
				panel.body.replaceChildren(guide);
			}
		}),
		settings: new Script({
			name: '⚙️ 全局设置',
			matches: [['所有页面', /.*/]],
			namespace: 'common.settings',
			configs: {
				notes: {
					defaultValue: $ui.notes([
						'✨鼠标移动到按钮或者输入框，可以看到提示！',
						'想要自动答题必须设置 “题库配置” ',
						'设置后进入章节测试，作业，考试页面即可自动答题。'
					]).outerHTML
				},
				answererWrappers: {
					separator: '自动答题设置',
					defaultValue: [] as AnswererWrapper[]
				},
				/**
				 * 禁用的题库
				 */
				disabledAnswererWrapperNames: {
					defaultValue: [] as string[]
				},
				/**
				 * 图片题优化警告的已关闭记录（题库签名列表，不在面板显示）：
				 * 用户手动关闭警告后记录当前题库签名，同配置下不再重复弹出，
				 * 题库配置变化（签名不同）时重新提示
				 */
				imageOptimizeWarnRecords: {
					defaultValue: [] as string[]
				},

				answererWrappersButton: {
					label: '题库配置',
					defaultValue: '点击配置',
					attrs: {
						type: 'button'
					},
					/** 「⋯」更多按钮：悬浮显示下拉框，选择题库配置获取方式（官方题库 / 自定义题库），点击选项直接打开对应弹窗（组件见 utils/ui.ts） */
					suffixSlot() {
						// 未配置一键获取渠道时不显示「⋯」下拉（主按钮直接使用自定义题库弹窗）
						return getAnswererConfigProvider() ? createAnswererModeDropdown() : '';
					},
					onload() {
						const aws: any[] = CommonProject.scripts.settings.cfg.answererWrappers || [];
						this.value = aws.length ? aws.length + ' 个可用题库（点击进入配置）' : '点击进入配置';

						/**
						 * 打开题库配置弹窗
						 * @param mode official（默认）= 一键获取；custom = 手动配置（仅从「⋯」下拉进入）
						 */
						const openAnswererModal = (mode: 'official' | 'custom') => {
							const aw: any[] = CommonProject.scripts.settings.cfg.answererWrappers || [];

							/** 题库列表容器：打开弹窗 / 题库变更时重新渲染，组件内部自动检测延迟 */
							const listContainer = h('div');
							const renderAnswererList = () => {
								const current: any[] = CommonProject.scripts.settings.cfg.answererWrappers || [];
								listContainer.replaceChildren(
									...(current.length
										? [createAnswererWrapperSection(current, '已解析的题库配置：', answererListHandlers)]
										: [])
								);
							};
							renderAnswererList();
							const textarea = h(
								'textarea',
								{
									className: 'modal-input',
									style: { minHeight: '250px', width: 'calc(100% - 20px)', maxWidth: '100%' },
									placeholder: aw.length ? '重新输入题库配置' : '输入你的题库配置...，不会请看上方填写教程'
								},
								aw.length === 0 ? '' : JSON.stringify(aw, null, 4)
							);

							const select = $ui.tooltip(
								h(
									'select',
									{
										className: 'base-style-active-form-control',
										style: { backgroundColor: '#eef2f7', borderRadius: '2px', padding: '2px 8px' }
									},
									[
										h('option', '默认'),
										h(
											'option',
											{
												title:
													'大学生网课题库接口适配器: 将不同的题库整合为一个API接口。详细查看 https://github.com/DokiDoki1103/tikuAdapter'
											},
											'TikuAdapter'
										)
									]
								)
							);

							/**
							 * 保存解析后的题库配置：手动保存与一键获取共用（含去重、上限、白名单校验与成功提示）
							 * @param showSuccessModal 是否弹出「配置成功」弹窗（一键获取流程使用弹窗内状态条替代，传 false）
							 * @returns 配置是否成功写入
							 */
							const applyAws = async (awsResult: AnswererWrapper[], showSuccessModal = true): Promise<boolean> => {
								if (awsResult.length === 0) {
									$modal.alert({ content: '题库配置不能为空，请重新配置。' });
									return false;
								}

								// 唯一化处理
								const result_set: AnswererWrapper[] = [];
								for (const res of awsResult) {
									if (result_set.find((i) => JSON.stringify(i) === JSON.stringify(res))) {
										continue;
									}
									result_set.push(res);
								}
								awsResult = result_set;

								// 判断新旧是否一致，如果一致则提示（视为成功：配置已生效，无需重复写入）
								// 一键获取流程（showSuccessModal=false）不弹提示，由弹窗内成功状态承接
								if (JSON.stringify(CommonProject.scripts.settings.cfg.answererWrappers) === JSON.stringify(awsResult)) {
									if (showSuccessModal) {
										$modal.alert({ content: h('div', ['✅️已应用题库配置，但您新配置的题库似乎没有变化~']) });
									}
									return true;
								}

								// 判断题库是否超过限制（10个），如果超过则提示
								if (awsResult.length > 10) {
									$modal.alert({
										content: h('div', [
											'题库配置过多可能会导致答题效率降低，建议不超过10个题库，目前解析到' +
												awsResult.length +
												'个题库，请删除一些不必要的题库后重新配置！'
										])
									});
									return false;
								}

								// 安全检测：解析器（handler）代码将在答题时以用户身份执行，
								// 若存在可疑代码特征（网络请求/读取存储/混淆代码等）需用户确认后才允许保存
								const confirmed = await confirmRiskyAnswerWrappers(awsResult);
								if (!confirmed) {
									return false;
								}

								// 全局跨域提交改动事件
								CommonEvents.emitAnswererChanged(awsResult, CommonProject.scripts.settings.cfg.answererWrappers);

								// ============================ 配置成功 ============================

								CommonProject.scripts.settings.cfg.answererWrappers = awsResult;
								this.value = '当前有' + awsResult.length + '个可用题库';
								if (showSuccessModal) {
									$modal.confirm({
										width: 600,
										content: h('div', [
											h('div', ['🎉 配置成功，', h('b', ' 刷新界面 '), '或者', h('b', ' 重新答题 '), '即可生效。']),
											createAnswererWrapperSection(awsResult, '解析到的题库如下所示：', answererListHandlers, false)
										]),
										onConfirm: () => {
											if ($gm.isInGMContext()) {
												top?.document.location.reload();
											}
										},
										...($gm.isInGMContext()
											? {
													confirmButtonText: '立即刷新',
													cancelButtonText: '稍后刷新'
											  }
											: {})
									});
								}

								// 格式化文本
								textarea.value = JSON.stringify(awsResult, null, 4);

								// 检测 connects.length 是因为 如果在软件的软件设置全局配置中，上下文的 GM_info 会变成空
								const connects: string[] = $gm.getMetadataFromScriptHead('connect');
								if (connects.length) {
									// 检测是否有域名白名单
									const notAllowed: string[] = [];

									// 如果是通用版本，则不检测
									if (connects.includes('*')) {
										return true;
									}

									for (const aw of awsResult) {
										if (connects.some((connect) => new URL(aw.url).hostname.includes(connect)) === false) {
											notAllowed.push(aw.url);
										}
									}
									if (notAllowed.length) {
										$modal.alert({
											width: 600,
											maskCloseable: false,
											title: '⚠️警告',
											content: h('div', [
												h('div', [
													'配置成功，但检测到以下 域名/ip 不在脚本的白名单中，请安装 : ',
													h(
														'a',
														{
															href: 'https://docs.ocsjs.com/docs/other/api#全域名通用版本'
														},
														'OCS全域名通用版本'
													),
													'，或者手动添加 @connect ，否则无法进行请求。',
													h(
														'ul',
														notAllowed.map((url) => h('li', new URL(url).hostname))
													)
												])
											])
										});
									}
								}

								return true;
							};

							// —— 一键获取题库配置（题库站连接页登录后 postMessage 自动回传）——
							const provider = getAnswererConfigProvider();
							/** 一键获取状态框（默认隐藏，获取过程中替代按钮展示，结束后保留最终状态），组件见 utils/ui.ts */
							const { el: connectStatus, setStatus: setConnectStatus } = createStatusBox();

							/** 一键获取 Hero 头部（简洁浅色底 + 居中大标题 + 题库源信息），仅配置了 provider 时创建 */
							const connectHero = provider
								? (() => {
										/** 从 connectUrl 的 origin 解析根目录官网链接 */
										let origin = provider.connectUrl;
										try {
											origin = new URL(provider.connectUrl).origin;
										} catch {
											// connectUrl 非法时展示原文
										}
										return createHero({
											icon: '🚀',
											title: '一键获取题库配置',
											subtitle: '打开题库网站并登录即可，配置自动回填，无需手动复制粘贴',
											extra: h('span', [
												'题库源：',
												h('b', provider.name),
												'　官网：',
												h('a', { href: origin, target: '_blank' }, origin)
											])
										});
								  })()
								: undefined;

							/** 一键获取步骤指示器（① ② ③），组件见 utils/ui.ts */
							const connectSteps = provider
								? createSteps(['点击下方获取按钮、打开题库小窗', '完成登录', '自动回填保存'])
								: undefined;

							/** 一键获取按钮（位于弹窗底部，主色 CTA；获取中显示旋转加载），仅配置了 provider 时创建 */
							const connectButton = provider
								? h('button', '点击前往获取题库', (btn) => {
										// 无题库时底部按钮居中放大（.lg 见 custom.less）
										btn.className = 'aw-connect-btn' + (aw.length ? '' : ' lg');

										const defaultLabel = '点击前往获取题库';
										/** 切换加载状态：获取中禁用并显示旋转图标（样式由 .aw-connect-btn:disabled / .aw-spin 控制） */
										const setBtnLoading = (loading: boolean) => {
											btn.disabled = loading;
											btn.innerHTML = loading ? `${loadingSpinSvg}获取中 ...` : defaultLabel;
										};

										btn.onclick = async () => {
											// window.open 必须同步调用，防止被浏览器弹窗拦截
											const win = openAnswererConnect();
											if (!win) {
												setConnectStatus(
													'⚠️ 弹窗被浏览器拦截，请允许本站弹窗后重试，或点击题库配置旁的「⋯」选择「自定义题库」手动配置。',
													'error'
												);
												return;
											}
											// 获取中：按钮进入加载状态，状态区域接管展示
											setBtnLoading(true);
											setConnectStatus('⏳ 正在等待您在题库网站完成登录，登录后配置将自动回填保存。', 'info');
											try {
												// 边缘状态自动关闭授权小窗：配置弹窗被关闭时取消获取（页面关闭/刷新由 pagehide 处理）
												const aws = await waitForAnswererConfig(win, undefined, () => !modal?.isConnected);
												select.value = '默认';
												textarea.value = JSON.stringify(aws, null, 4);
												// 一键获取流程：不弹出「配置成功」弹窗，用弹窗内成功状态替代
												const saved = await applyAws(aws, false);
												if (saved) {
													// 接收配置后延迟 1 秒，再进入 3 秒关闭倒计时
													await new Promise((resolve) => setTimeout(resolve, 1000));
													// 3 秒倒计时提示后自动关闭题库站小窗（浏览器仅允许关闭由脚本 window.open 打开的窗口）
													for (let i = 3; i > 0; i--) {
														setConnectStatus(`✅ 题库配置已保存，${i} 秒后自动关闭小窗…`, 'success');
														await new Promise((resolve) => setTimeout(resolve, 1000));
													}
													setConnectStatus('✅ 题库配置已保存，重新答题或刷新界面 即可生效。', 'success');
													try {
														win.close();
													} catch {
														// 关闭失败不影响配置保存，用户可手动关闭
													}
												} else {
													// 保存被拦截（空配置/无变化/超上限），上方 alert 已说明原因
													setConnectStatus('⚠️ 配置未保存，请根据提示处理后重试。', 'error');
												}
											} catch (e: any) {
												setConnectStatus('⚠️ ' + (e?.message ?? '获取题库配置失败'), 'error');
											} finally {
												// 结束后恢复按钮，上方保留最终状态文本
												setBtnLoading(false);
											}
										};
								  })
								: undefined;

							/** 手动配置说明区（教程、剪贴板提示、多题库提示） */
							const manualNotes = $ui.notes([
								[
									h('div', { style: { fontSize: '16px', marginBottom: '8px' } }, [
										h('b', '题库配置填写教程👉：'),
										h('a', { href: 'https://docs.ocsjs.com/docs/work' }, 'https://docs.ocsjs.com/docs/work')
									])
								],
								[
									h(
										'div',
										{
											className: 'secondary'
										},
										[
											'⚠️ 如果无法粘贴，请点->：',
											h('button', '读取剪贴板', (btn) => {
												btn.classList.add('base-style-button');
												btn.onclick = () => {
													navigator.clipboard.readText().then((result) => {
														textarea.value = result;
													});
												};
											}),
											'，并同意浏览器上方的剪贴板读取申请。'
										]
									)
								],
								[
									h(
										'div',
										{ className: 'secondary' },
										'⚠️ 如果想添加多个不同的题库配置，请在每个配置之间使用三个井号隔开: ###。'
									)
								],
								[h('div', { className: 'secondary' }, '⚠️ 配置第三方题库出现网页弹窗的，点击永久允许连接。')]
							]);

							/** 清空题库配置（确认后清空并关闭弹窗），一键获取/手动配置弹窗共用 */
							const clearAnswererConfig = () => {
								$modal.confirm({
									content: '确定要清空题库配置吗？',
									onConfirm: () => {
										$message.success({ content: '已清空，在答题前请记得重新配置。' });
										modal?.remove();
										CommonProject.scripts.settings.cfg.answererWrappers = [];
										this.value = '点击配置';
									}
								});
							};

							/** 统一放大弹窗底部按钮（默认无内边距，偏小） */
							const enlargeFooterButton = (btn: HTMLButtonElement) => {
								btn.style.padding = '4px 12px';
								btn.style.fontSize = '14px';
							};

							/** 手动配置底部（填写/修改区 + 操作按钮），自定义题库获取方式下显示 */
							const manualFooter = h('div', { style: { width: '100%' } }, [
								h('div', { className: 'separator secondary' }, '题库配置填写/修改区'),
								textarea,
								h('div', { style: { marginTop: '12px', fontSize: '12px' } }, [
									// 解析器选项独占一行
									h('div', { style: { marginBottom: '12px' } }, ['解析器：', select]),
									// 清空题库配置左对齐，关闭/保存配置右对齐
									h('div', { style: { display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end' } }, [
										h('button', '清空题库配置', (btn) => {
											btn.className = 'modal-cancel-button';
											enlargeFooterButton(btn);
											btn.style.marginRight = 'auto';
											btn.onclick = () => clearAnswererConfig();
										}),
										h('button', '关闭', (btn) => {
											btn.className = 'modal-cancel-button';
											enlargeFooterButton(btn);
											btn.style.marginRight = '12px';
											btn.onclick = () => modal?.remove();
										}),
										h('button', '保存配置', (btn) => {
											btn.className = 'modal-confirm-button';
											enlargeFooterButton(btn);
											btn.onclick = async () => {
												const value = textarea.value;

												if (!value) {
													$modal.alert({
														content: h('div', '不能为空！')
													});
													return;
												}
												if (value.includes('adapter-service/search') && (select.value === 'TikuAdapter') === false) {
													$modal.alert({
														content: h('div', [
															'检测到您可能正在使用 ',
															h(
																'a',
																{ href: 'https://github.com/DokiDoki1103/tikuAdapter#readme' },
																'TikuAdapter 题库'
															),
															'，但是您选择的解析器不是 TikuAdapter，请选择 TikuAdapter 解析器，并填写接口地址即可，例如：http://localhost:8060/adapter-service/search，或者忽略此警告。'
														]),
														confirmButtonText: '切换至 TikuAdapter 解析器，并识别接口地址',
														onConfirm() {
															const origin = textarea.value.match(/http:\/\/(.+)\/adapter-service\/search/)?.[1] || '';
															textarea.value = `http://${origin}/adapter-service/search`;
															select.value = 'TikuAdapter';
														}
													});
													return;
												}

												try {
													const awsResult: AnswererWrapper[] = [];
													if (select.value === 'TikuAdapter') {
														if (value.startsWith('http') === false) {
															$modal.alert({
																content: h('div', [
																	'格式错误，TikuAdapter解析器只能解析 url 链接，请重新输入！或者查看：',
																	h(
																		'a',
																		{ href: 'https://github.com/DokiDoki1103/tikuAdapter#readme' },
																		'https://github.com/DokiDoki1103/tikuAdapter#readme'
																	)
																])
															});
															return;
														}
														select.value = '默认';
														awsResult.push({
															name: 'TikuAdapter题库',
															url: value,
															homepage: 'https://github.com/DokiDoki1103/tikuAdapter',
															method: 'post',
															type: 'GM_xmlhttpRequest',
															contentType: 'json',
															headers: {},
															data: {
																// eslint-disable-next-line no-template-curly-in-string
																question: '${title}',
																options: {
																	handler: "return (env)=>env.options?.split('\\n')"
																},
																type: {
																	handler:
																		" return (env)=> env.type === 'single' ? 0 : env.type === 'multiple' ? 1 : env.type === 'completion' ? 3 : env.type === 'judgement' ? 4 : undefined"
																}
															},
															handler: "return (res)=>res.answer.allAnswer.map(i=>([res.question,i.join('#')]))"
														});
													} else {
														const contents = value
															.split('###')
															.map((i) => i.trim())
															.filter(Boolean);
														for (const content of contents) {
															awsResult.push(...(await AnswerWrapperParser.from(content)));
														}
													}

													await applyAws(awsResult);
												} catch (e: any) {
													$modal.alert({
														content: h('div', [h('div', '解析失败，原因如下 :'), h('div', e.message)])
													});
												}
											};
										})
									])
								])
							]);

							/** 弹窗内容与底部：官方题库（主按钮默认）= 一键获取；自定义题库（「⋯」下拉进入）= 手动配置 */
							let modalContent: string | HTMLElement;
							let modalFooter: HTMLDivElement;

							if (mode === 'official' && provider && connectHero && connectButton && connectSteps) {
								/** 官方题库面板：Hero 头部 + 步骤条 + 状态区域 + 已配置题库列表（获取按钮在底部） */
								const connectPanel = h('div', [connectHero, connectSteps, connectStatus, listContainer]);
								/**
								 * 底部按钮：
								 * - 有题库：清空题库配置 + 自定义题库（小尺寸）靠左，关闭 + 一键获取靠右
								 * - 无题库：隐藏自定义题库，关闭 + 一键获取居中并放大
								 */
								const connectFooter = h(
									'div',
									{
										style: {
											width: '100%',
											position: 'relative',
											display: 'flex',
											justifyContent: 'center',
											alignItems: 'center',
											flexWrap: 'wrap',
											gap: '12px',
											marginTop: '24px'
										}
									},
									[
										...(aw.length
											? [
													h('button', '清空题库配置', (btn) => {
														btn.className = 'modal-cancel-button';
														// 左侧辅助按钮使用较小尺寸，弱化视觉层级
														btn.style.padding = '2px 8px';
														btn.style.fontSize = '12px';
														btn.onclick = () => clearAnswererConfig();
													}),
													h('button', '手动配置题库', (btn) => {
														btn.className = 'modal-cancel-button';
														btn.style.padding = '2px 8px';
														btn.style.fontSize = '12px';
														// 与右侧关闭/获取按钮同一行对齐，左组按钮靠左放置
														btn.style.marginRight = 'auto';
														btn.title = '手动填写或粘贴题库配置';
														btn.onclick = () => {
															modal?.remove();
															openAnswererModal('custom');
														};
													})
											  ]
											: []),
										h('button', '关闭', (btn) => {
											btn.className = 'modal-cancel-button';
											if (aw.length) {
												enlargeFooterButton(btn);
											} else {
												// 无题库时与获取按钮同为居中主操作，放大尺寸
												btn.style.padding = '8px 24px';
												btn.style.fontSize = '15px';
											}
											btn.onclick = () => modal?.remove();
										}),
										connectButton
									]
								);
								modalContent = connectPanel;
								modalFooter = connectFooter;
							} else {
								// 自定义题库（或未配置 provider）：保持原有单页结构，已配置列表脱离 notes 独立展示
								modalContent = h('div', [manualNotes, listContainer]);
								modalFooter = manualFooter;
							}

							const modal = $modal.prompt({
								width: 600,
								maskCloseable: false,
								content: modalContent,
								footer: modalFooter
							});

							// 题库变更（保存/清空/一键获取回填）时重新渲染列表并自动检测延迟，弹窗关闭时注销监听
							const awChangeListener = CommonProject.scripts.settings.onConfigChange(
								'answererWrappers',
								(_key, _value, remote) => {
									if (remote === false) {
										renderAnswererList();
									}
								}
							);
							if (modal) {
								const originalRemove = modal.remove.bind(modal);
								modal.remove = () => {
									CommonProject.scripts.settings.offConfigChange(awChangeListener);
									originalRemove();
								};
							}

							// 无题库时进入一键配置弹窗，延迟 1 秒自动开始获取（仍在用户激活窗口期内，window.open 不会被拦截）
							if (mode === 'official' && aw.length === 0 && connectButton) {
								setTimeout(() => {
									// 延迟期间用户已关闭弹窗则不再自动获取
									if (modal?.isConnected) {
										connectButton.click();
									}
								}, 1000);
							}
						};

						// 主按钮默认打开一键题库配置；未配置获取渠道时使用自定义题库弹窗
						this.onclick = () => openAnswererModal(getAnswererConfigProvider() ? 'official' : 'custom');
						// 暴露给「⋯」下拉框的选项进入对应配置弹窗（自定义题库仅从此处进入）
						(this as any).openAnswererModal = openAnswererModal;
					}
				},
				upload: {
					label: '答案提交方式（提交率）',
					tag: 'select',
					defaultValue: 80 as WorkUploadType,
					options: [
						[
							'save',
							'自动保存（不提交）',
							'答题结束后自动保存答案，但不会提交试卷。注意：如果开启了随机作答，保存后可能无法分辨答案是否正确。'
						],
						[
							'nomove',
							'不保存也不提交',
							'答题结束后不进行任何保存或提交，等待时间过后自动进入下一节，适合测试脚本时使用。'
						],
						...([10, 20, 30, 40, 50, 60, 70, 80, 90].map((rate) => [
							rate,
							`搜到 ${rate}%的答案就自动提交`,
							`例如共100道题，只要有 ${rate} 道题搜索到答案，就会自动提交试卷（答案不一定正确）。`
						]) as [any, string, string][]),
						['100', '全部题目都搜到答案才提交', '所有题目都搜索到答案后才自动提交试卷（答案不一定正确）。'],
						[
							'force',
							'不管有没有答案都强制提交',
							'不管是否搜到答案、答案是否正确，答题结束后直接强制提交试卷。风险较高，如需开启请配合随机作答谨慎使用。'
						]
					],
					attrs: {
						title:
							'提交方式（提交率）：设置自动答题结束后如何保存/提交答案\n鼠标悬浮在选项上可以查看每个选项的具体解释。\n\n注意：提交率无法控制题库的正确率，题库搜索到的答案不一定正确。'
					}
				},
				'work-when-no-job': {
					defaultValue: false,
					label: '强制答题（仅超星）',
					attrs: {
						type: 'checkbox',
						title:
							'当章节测试左上角并没有黄色任务点的时候依然进行答题（没有任务点说明此作业可能不计入总成绩，如果老师要求则可以开启）'
					}
				},
				'randomWork-choice': {
					defaultValue: false,
					label: '随机选择（仅超星）',
					attrs: { type: 'checkbox', title: '题库搜索不到答案时，随机选择任意一个选项，仅支持超星章节测试' }
				},
				'randomWork-complete': {
					defaultValue: false,
					label: '随机填空（仅超星）',
					attrs: { type: 'checkbox', title: '题库搜索不到答案时，随机填写以下任意一个文案，仅支持超星章节测试' }
				},
				'randomWork-completeTexts-textarea': {
					defaultValue: ['不会', '不知道', '不清楚', '不懂', '不会写'].join('\n'),
					label: '随机填空文案（仅超星）',
					tag: 'textarea',
					showIf: 'common.settings.randomWork-complete',
					attrs: { title: '每行一个，随机填入', style: { minWidth: '200px', minHeight: '50px' } },
					onload(el) {
						el.addEventListener('change', () => {
							if (String(el.value).trim() === '') {
								el.value = el.defaultValue;
							}
						});
					}
				},
				advancedSettings: {
					...dropdownStyle,
					defaultValue: false,
					label: '高级设置',
					attrs: { type: 'checkbox', title: '请谨慎使用高级设置，可能会影响答题效果，小白在未理解的情况下谨慎调整。' }
				},
				thread: {
					showIf: 'common.settings.advancedSettings',
					elementClassName: 'config-details',
					label: '线程数量（个）',
					attrs: {
						type: 'number',
						min: 1,
						step: 1,
						max: 3,
						title:
							'同一时间内答题线程工作的数量（例子：三个线程则代表一秒内同时搜索三道题），过多可能导致题库服务器压力过大，请适当调低。'
					},
					defaultValue: 1
				},
				imageOptimize: {
					showIf: 'common.settings.advancedSettings',
					elementClassName: 'config-details',
					label: '图片题优化',
					attrs: {
						type: 'checkbox',
						title:
							'遇到图片题解析图片成 Base64 上传给题库，防止遇到防盗链等问题无法加载。' +
							`需题库配置支持（POST 方法且引用了 \${images} / \${suggestion_title} / \${suggestion_options} 字段），` +
							'否则需重新配置题库。原题 title / options 不会被修改。'
					},
					defaultValue: true
				},
				answerWrapperHandlerTimeout: {
					showIf: 'common.settings.advancedSettings',
					elementClassName: 'config-details',
					label: '搜题最大耗时（秒）',
					attrs: {
						type: 'number',
						min: 10,
						step: 1,
						max: 3 * 60,
						title: '搜题超时时间，单位为秒，超过这个时间直接放弃，进行下一题搜索。'
					},
					defaultValue: 120
				},
				stopSecondWhenFinish: {
					showIf: 'common.settings.advancedSettings',
					elementClassName: 'config-details',
					label: '答题结束后暂停（秒）',
					attrs: {
						type: 'number',
						min: 3,
						step: 1,
						max: 9999,
						title: '自动答题脚本结束后暂停的时间（方便查看和检查）。'
					},
					defaultValue: 3
				},
				period: {
					showIf: 'common.settings.advancedSettings',
					elementClassName: 'config-details',
					label: '搜题间隔（秒）',
					attrs: {
						type: 'number',
						min: 1,
						step: 1,
						max: 60,
						title: '每道题的搜题间隔时间，不建议太低，避免增加服务器压力。'
					},
					defaultValue: 3
				},
				answerSeparators: {
					showIf: 'common.settings.advancedSettings',
					elementClassName: 'config-details',
					label: '答案分隔符',
					attrs: {
						title: "分隔答案的符号，例如：答案1#答案2#答案3，分隔符为 #， 使用英文逗号进行隔开 : ',' "
					},
					defaultValue: ['===', '#', '---', '###', '|', ';', '；'].join(','),
					onload(el) {
						el.addEventListener('change', () => {
							if (String(el.value).trim() === '') {
								el.value = el.defaultValue;
							}
						});
					}
				},
				redundanceWordsText: {
					showIf: 'common.settings.advancedSettings',
					elementClassName: 'config-details',
					defaultValue: [
						'单选题(必考)',
						'填空题(必考)',
						'多选题(必考)',
						'(单选题)',
						'(多选题)',
						'(判断题)',
						'(填空题)',
						'【单选题】',
						'【多选题】',
						'【填空题】',
						'【判断题】',
						'【單選题】',
						'【多選题】',
						'【判斷题】',
						'【Single Choice】',
						'【Multiple Choice】',
						'【single choice】',
						'【multiple choice】',
						'【True or False】'
					].join('\n'),
					label: '题目冗余字段自动删除',
					tag: 'textarea',
					attrs: {
						title: '在搜题的时候自动删除多余的文字，以便提高搜题的准确度，每行一个。',
						style: { minWidth: '200px', minHeight: '50px' }
					},
					onload(el) {
						el.addEventListener('change', () => {
							if (String(el.value).trim() === '') el.value = el.defaultValue;
						});
					}
				},
				notification: {
					separator: '其他设置',
					label: '系统通知',
					attrs: {
						title:
							'允许脚本发送系统通知，只有重要事情发生时会发送系统通知，尽量避免用户受到骚扰（在电脑屏幕右侧显示通知弹窗，例如脚本执行完毕，图形验证码，版本更新等通知）。'
					},
					tag: 'select',
					defaultValue: 'only-notify' as 'only-notify' | 'notify-and-voice' | 'all' | 'no-notify',
					suffixSlot: function () {
						const btn = h('button', { className: 'base-style-button-secondary' }, '📢测试通知');
						btn.onclick = () => {
							this.methods.notificationBySetting('这是一条测试通知');
						};
						return btn;
					},
					options: [
						['only-notify', '只显示右下角通知'],
						['notify-and-voice', '通知以及提示音（叮的一声）'],
						['all', '通知，提示音，以及任务栏闪烁提示'],
						['no-notify', '关闭系统通知']
					]
				},
				enableQuestionCaches: {
					label: '题库缓存功能',
					defaultValue: true,
					attrs: { type: 'checkbox' },
					suffixSlot: function () {
						const btn = h('button', { className: 'base-style-button-secondary' }, '⚙️管理缓存');
						btn.onclick = () => {
							BackgroundProject.scripts.data.methods.showQuestionCaches();
						};
						return btn;
					}
				}
			},
			methods() {
				return {
					/**
					 * 获取自动答题配置，包括题库配置
					 */
					getWorkOptions: () => {
						// 使用 json 深拷贝，防止修改原始配置
						const workOptions: typeof this.cfg = JSON.parse(JSON.stringify(this.cfg));

						/**
						 * 过滤掉被禁用的题库
						 */
						workOptions.answererWrappers = workOptions.answererWrappers.filter(
							(aw) => this.cfg.disabledAnswererWrapperNames.find((daw) => daw === aw.name) === undefined
						);

						return workOptions;
					},
					/**
					 * 根据全局设置的配置，发起通知
					 * @param content
					 * @param opts
					 */
					notificationBySetting: (
						content: string,
						opts?: {
							extraTitle?: string;
							/** 显示时间，单位为秒，默认为 30 秒， 0 则表示一直存在 */
							duration?: number;
							/** 通知点击时 */
							onclick?: () => void;
							/** 通知关闭时 */
							ondone?: () => void;
						}
					) => {
						if (this.cfg.notification !== 'no-notify') {
							$gm.notification(content, {
								extraTitle: opts?.extraTitle,
								duration: opts?.duration ?? 30,
								important: this.cfg.notification === 'all',
								silent: this.cfg.notification === 'only-notify'
							});
						}
					}
				};
			},
			// 实时更新内部设置
			oncomplete() {
				AnswerWrapperHandlerConfig.timeout_seconds = this.cfg.answerWrapperHandlerTimeout;
				this.onConfigChange('answerWrapperHandlerTimeout', (sec) => {
					AnswerWrapperHandlerConfig.timeout_seconds = sec;
				});

				// 图片题优化兼容性检测：仅提示，不限制。
				// 因为上传内容由题库配置占位符决定，原题 title / options 不再被覆盖，
				// 旧配置不会上传新增字段，所以即便不支持也是安全的，这里只做引导提示。
				//
				// 防频繁打扰（警告曾导致界面交互困难）：
				// 1. 仅顶层窗口检测——oncomplete 在每个 iframe 都会执行，子帧 $message 经 cors
				//    全部转发到顶层，会造成多条相同警告堆叠；
				// 2. 配置签名记忆——用户手动关闭后记录当前题库签名到 imageOptimizeWarnRecords，
				//    同配置下不再弹出，仅当题库配置变化（签名改变）时才重新提示。
				const checkImageOptimizeCompatibility = () => {
					if (self !== top) {
						return;
					}
					const wrappers = this.cfg.answererWrappers || [];
					// 题库为空 / 关闭图片题优化 / 配置已支持：清除提示
					if (!this.cfg.imageOptimize || wrappers.length === 0 || isAnswererWrappersSupportImageOptimize(wrappers)) {
						state.setting.imageOptimizeMessage?.remove();
						state.setting.imageOptimizeMessage = undefined;
						return;
					}
					// 用户已在此配置下关闭过提示：不再重复打扰
					// 签名为全字段内容哈希（算法见 answerer-env.ts），任何实质配置变化都会重新触发警告
					const signature = createAnswererWrappersSignature(wrappers);
					if (this.cfg.imageOptimizeWarnRecords.includes(signature)) {
						return;
					}
					if (!state.setting.imageOptimizeMessage) {
						state.setting.imageOptimizeMessage = $message.warn({
							content: h('div', [
								'当前题库配置暂不支持图片、公式等题目处理',
								h('br'),
								'请前往题库配置源头获取新配置并重新配置题库，否则图片题优化功能无法生效。',
								h('br'),
								'题库开发人员请查看： https://docs.ocsjs.com/docs/other/api'
							]),
							duration: 0,
							onClose: () => {
								// 记录关闭时的题库签名（remove() 清除提示不会触发 onClose，仅用户主动关闭才记录）。
								// 上限 50 条，防止记录无限增长
								if (!this.cfg.imageOptimizeWarnRecords.includes(signature)) {
									this.cfg.imageOptimizeWarnRecords = [...this.cfg.imageOptimizeWarnRecords, signature].slice(-50);
								}
								state.setting.imageOptimizeMessage = undefined;
							}
						});
					}
				};

				checkImageOptimizeCompatibility();
				this.onConfigChange('imageOptimize', () => checkImageOptimizeCompatibility());
				this.onConfigChange('answererWrappers', () => checkImageOptimizeCompatibility());
			}
		}).withEvents<{ 'answerer-wrapper-change': (curr: AnswererWrapper[], pre: AnswererWrapper[]) => void }>(),

		workResults: new Script({
			name: '🔎 搜索结果',
			matches: [['所有页面', /.*/]],
			namespace: 'common.work-results',
			configs: {
				notes: {
					defaultValue: $ui.notes(['点击题目序号，查看搜索结果', '如果没有搜到，可能是题库没有收录该题目答案'])
						.outerHTML
				},
				currentResultIndex: {
					defaultValue: 0
				},
				/**
				 * 是否为动态答题器（题目动态加载，结果逐题累积，例如超星非整卷预览、智慧树/智慧职教逐题作答），
				 * 动态答题器不会自动清空搜索结果，因此需要显示手动清空按钮
				 */
				dynamicResults: {
					defaultValue: false
				},
				questionPositionSyncHandlerType: {
					defaultValue: undefined as keyof typeof state.workResult.questionPositionSyncHandler | undefined
				}
			},
			methods() {
				return {
					/**
					 * 【全量模式】更新指定序号的结果（仅更新该序号，不触碰其他结果）。
					 * 用于整卷答题：onResultsUpdate(current, index, res) 时逐项推进，
					 * 数组长度不足时以空占位结果补齐中间空位（多线程答题结果可能乱序到达）。
					 */
					update: async (index: number, result: SimplifyWorkResult): Promise<void> => {
						const data = (await $store.getTab(TAB_WORK_RESULTS_KEY)) || [];
						const placeholder = {
							question: '',
							searchInfos: [],
							requested: false,
							resolved: false,
							type: undefined
						} as unknown as SimplifyWorkResult;
						while (data.length < index) {
							data.push(placeholder);
						}
						data[index] = result;
						await $store.setTab(TAB_WORK_RESULTS_KEY, data);
						cacheIfFinished(result);
						CommonEvents.emitWorkerChanged(result);
					},

					/**
					 * 仅可在 【全量模式】 搜题下使用
					 * 【全量模式】填充全部题目：整卷答题时于 onResultsUpdate 调用，
					 * 使结果面板立即显示全部题目（等待处理中），随后由 update 逐项推进状态
					 * （等待搜索中→等待答题中→已答题/失败）。
					 *
					 * 与 core 的协作：core worker 在搜题线程启动前会触发首次 onResultsUpdate
					 * （携带全部题目的空状态），本方法的首次有效调用即发生在此时。
					 * 仅当传入数组比当前存储更长时才写入（按位置保留已有最新状态），重复调用无副作用。
					 */
					fillAll: async (results: SimplifyWorkResult[]): Promise<void> => {
						await $store.setTab(TAB_WORK_RESULTS_KEY, results);
					},
					append: async (result: SimplifyWorkResult): Promise<void> => {
						CommonProject.scripts.workResults.cfg.dynamicResults = true;
						const data = (await $store.getTab(TAB_WORK_RESULTS_KEY)) || [];
						// 空题目文本不参与匹配（防止多个空标题占位互相覆盖）
						const index = result.question
							? data.findIndex((r: SimplifyWorkResult) => r.question === result.question)
							: -1;
						if (index >= 0) {
							data[index] = result;
						} else {
							data.push(result);
						}
						await $store.setTab(TAB_WORK_RESULTS_KEY, data);
						cacheIfFinished(result);
						CommonEvents.emitWorkerChanged(result);
					},
					/**
					 * 清空搜索结果
					 */
					clearResults: () => {
						return $store.setTab(TAB_WORK_RESULTS_KEY, []);
					},
					getResults(): Promise<SimplifyWorkResult[]> | undefined {
						return $store.getTab(TAB_WORK_RESULTS_KEY) || undefined;
					},
					/**
					 * 开始新答题前初始化：清空搜索结果并重置内部状态
					 * @param opts.dynamic 是否为动态答题器（题目动态加载，结果逐题累积），动态答题器会显示手动清空按钮
					 */
					init(opts?: {
						questionPositionSyncHandlerType?: keyof typeof state.workResult.questionPositionSyncHandler;
						dynamic?: boolean;
					}) {
						CommonProject.scripts.workResults.cfg.questionPositionSyncHandlerType =
							opts?.questionPositionSyncHandlerType;
						CommonProject.scripts.workResults.cfg.dynamicResults = opts?.dynamic ?? false;
						// 清空搜索结果（进度统计由结果数组派生，无需额外重置）。
						// 注意：此处不能 return 该调用，否则 init 的推断返回类型会依赖 CommonProject 自身形成 TS7022 循环
						CommonProject.scripts.workResults.methods.clearResults();
					},
					/**
					 * 创建搜索结果面板
					 * @param mount 挂载点
					 */
					createWorkResultsPanel: (mount?: HTMLElement) => {
						const container = mount || h('div');
						container.style.width = '400px';
						/** 记录滚动高度 */
						let scrollPercent = 0;

						/** 列表 */
						const list = $ui.tooltip(h('div', { className: 'work-result-list' }));

						list.onscroll = () => {
							scrollPercent = list.scrollTop / list.scrollHeight;
						};

						/** 给序号设置样式 */
						const setNumStyle = (result: SimplifyWorkResult, num: HTMLElement, index: number) => {
							// 正在搜题：序号方块边框显示转圈路径动画（保留序号数字，下一状态渲染时自动恢复）
							if (result.searching) {
								num.classList.add('searching');
							}

							if (result.requested) {
								num.classList.add('requested');
							}

							if (index === this.cfg.currentResultIndex) {
								num.classList.add('active');
							}

							if (result.finish) {
								num.classList.add('finish');
							} else {
								if (
									result.requested &&
									result.resolved &&
									(result.error?.trim().length !== 0 || result.searchInfos.length === 0 || result.finish === false)
								) {
									num.classList.add('error');
								}
							}
						};

						/** 渲染结果面板 */
						const render = debounce(async (first: boolean) => {
							let results: SimplifyWorkResult[] | undefined =
								await CommonProject.scripts.workResults.methods.getResults();

							if (results?.length) {
								// 首次渲染移除全部实时状态
								if (first) {
									results = results.map((r) => {
										r.searching = false;
										return r;
									});
								}

								// 进度统计：从结果数组派生，与序号状态严格一致
								const stats = count(results);

								// 如果序号指向的结果为空，则代表已经被清空，则重新让index变成0
								if (results[this.cfg.currentResultIndex] === undefined) {
									this.cfg.currentResultIndex = 0;
								}

								// 渲染序号结果
								const resultContainer = h('div', { className: 'work-result-container' });

								/** 基础提示信息 */
								const baseInfos = [
									`已搜题: ${stats.requested}/${stats.total}`,
									`已答题: ${stats.resolved}/${stats.total}`,
									'⚪ 白色序号：等待处理中',
									'🔵 蓝边序号：已完成搜索',
									'🔵 蓝色序号：已搜索已答题',
									'🔴 红色序号：搜索失败或没答案/不匹配等情况',
									'',
									'👉点击序号，查看搜索结果'
								];

								/** 渲染序号 */
								const nums = results.map((result, index) => {
									return h('span', { className: 'search-infos-num', innerText: (index + 1).toString() }, (num) => {
										setNumStyle(result, num, index);

										num.onclick = () => {
											for (const n of nums) {
												n.classList.remove('active');
											}
											num.classList.add('active');
											// 更新显示序号
											this.cfg.currentResultIndex = index;
											// 重新渲染结果列表
											resultContainer.replaceChildren(createResult(result));
											// 触发页面题目元素同步器
											if (this.cfg.questionPositionSyncHandlerType) {
												state.workResult.questionPositionSyncHandler[this.cfg.questionPositionSyncHandlerType]?.(index);
											}
										};
									});
								});

								/** 问号图标：承载答题进度与序号解释提示，避免整区域 tooltip 阻挡序号点击 */
								const helpIcon = $ui.tooltip(
									h(
										'span',
										{
											className: 'search-infos-help',
											title: baseInfos.join('\n')
										},
										'?'
									)
								);

								list.replaceChildren(helpIcon, ...nums);
								// 初始显示指定序号的结果
								resultContainer.replaceChildren(createResult(results[this.cfg.currentResultIndex]));

								container.replaceChildren(list, resultContainer);

								/** 恢复高度 */
								list.scrollTo({
									top: scrollPercent * list.scrollHeight,
									behavior: 'auto'
								});

								/** 清空搜索结果按钮：仅动态答题器（结果逐题累积、不会自动清空）时显示在所有搜索结果的最下方；
								 *  且仅在 worker 停止（结束/错误/暂停）时显示，正在搜题时隐藏，避免误清空正在累积的结果 */
								if (this.cfg.dynamicResults && !state.workResult.isWorkerWorking) {
									container.append(
										h('div', { style: { textAlign: 'right', marginTop: '8px' } }, [
											$ui.tooltip(
												$ui.button('清空搜索结果', { className: 'base-style-button-secondary' }, (btn) => {
													btn.title =
														'当前为动态答题模式（题目逐题加载，结果累积显示），不会自动清空搜索结果\n点击后清空搜索结果';
													btn.onclick = () => {
														this.methods.clearResults();
														const { panel, header } = CXProject.scripts.work;
														if (panel && header) {
															CXProject.scripts.work.onrender?.({ panel, header });
															CommonProject.scripts.workResults.onrender?.({ panel, header });
														}
													};
												})
											)
										])
									);
								}
							} else {
								container.replaceChildren(
									h('div', { className: 'alert-info-wrapper' }, [
										h('div', '暂无任何搜索结果~', (div) => {
											div.style.marginTop = '12px';
											div.className = 'result-info no-answer';
										})
									])
								);
							}
						}, 100);

						/** 渲染结果列表 */
						const createResult = (result: SimplifyWorkResult | undefined) => {
							if (result) {
								return h('div', [
									createSearchResultAlertElement(result),
									h(SearchInfosElement, {
										infos: result.searchInfos,
										question: result.question,
										type: result.type
									})
								]);
							} else {
								return h('div', 'undefined');
							}
						};

						render(true);
						// 结果数据变化是唯一的重渲染数据源（update/append/clearResults 均写此 key）
						$store.addTabChangeListener(TAB_WORK_RESULTS_KEY, render);
						// worker 工作状态变化时重渲染（控制"清空搜索结果"按钮显隐）
						workerWorkingChangeListeners.add(() => render(false));

						return container;
					}
				};
			},
			onrender({ panel }) {
				panel.body.replaceChildren(this.methods.createWorkResultsPanel());
			},
			oncomplete() {
				let working_msg: HTMLElement | undefined;
				CommonProject.scripts.workResults.on('work-state-change', (workerState) => {
					if (workerState === 'start') {
						// 防重：continuate 恢复答题会再次触发 start，先移除旧气泡
						working_msg?.remove();
						working_msg = $message.info({ content: loadingSpinSvg + ' 正在搜题中...', duration: 0 });
					} else {
						working_msg?.remove();
						working_msg = undefined;
					}
				});
				CommonProject.scripts.workResults.on('work-current-result-change', (cur) => {
					if (cur.searching) {
						if (working_msg) working_msg.innerHTML = loadingSpinSvg + ` 正在搜题 ${formatQuestionForMessage(cur.question)}`;
					}
				});
			}
		}).withEvents<{
			'work-state-change': (state: 'done' | 'start' | 'stop' | 'close') => void;
			'work-current-result-change': (cur: SimplifyWorkResult) => void;
		}>(),
		onlineSearch: new Script({
			name: '🌐 在线搜题',
			matches: [['所有页面', /.*/]],
			namespace: 'common.online-search',
			configs: {
				notes: {
					defaultValue: '查题前请在 “通用-全局设置” 中设置题库配置，才能进行在线搜题。'
				},

				selectSearch: {
					label: '划词搜索',
					defaultValue: true,
					attrs: { type: 'checkbox', title: '使用鼠标滑动选择页面中的题目进行搜索。' }
				},
				searchValue: {
					sync: true,
					label: '搜索题目',
					tag: 'textarea',
					attrs: {
						placeholder: '输入题目，请尽量保证题目完整，不要漏字',
						style: {
							minWidth: '300px',
							minHeight: '64px'
						}
					},
					defaultValue: ''
				}
			},
			oncomplete() {
				document.addEventListener(
					'selectionchange',
					debounce(() => {
						if (this.cfg.selectSearch) {
							const val = document.getSelection()?.toString() || '';
							if (val) {
								this.cfg.searchValue = val;
							}
						}
					}, 500)
				);
			},
			onrender({ panel }) {
				const content = h('div', '', (content) => {
					content.style.marginBottom = '12px';
				});

				const search = async (value: string) => {
					if (CommonProject.scripts.settings.cfg.answererWrappers.length === 0) {
						$modal.alert({ content: '请先在 通用-全局设置 配置题库，才能进行在线搜题。' });
						return;
					}

					content.replaceChildren(h('span', '搜索中...'));

					if (value) {
						const t = Date.now();
						const { env } = await buildAnswererEnv({
							title: value,
							enableImageOptimize: CommonProject.scripts.settings.cfg.imageOptimize
						});
						const infos = await defaultAnswerWrapperHandler(CommonProject.scripts.settings.cfg.answererWrappers, env);
						// 耗时计算
						const resume = ((Date.now() - t) / 1000).toFixed(2);

						content.replaceChildren(
							h(
								'div',
								[
									h('hr'),
									h(
										'div',
										{ style: { color: '#a1a1a1' } },
										`搜索到 ${infos.map((i) => i.results).flat().length} 个结果，共耗时 ${resume} 秒`
									),
									h(SearchInfosElement, {
										infos: infos.map((info) => ({
											results: info.results.map(
												(res) => [res.question, res.answer, res.extra_data] as [string, string, object]
											),
											homepage: info.homepage,
											name: info.name,
											error: info.error
										})),
										question: value
									})
								],
								(div) => {
									div.classList.add('card');
									div.style.width = '480px';
								}
							)
						);
					} else {
						content.replaceChildren(h('span', '题目不能为空！'));
					}
				};

				const button = h('button', '搜索', (button) => {
					button.className = 'base-style-button';
					button.style.width = '120px';
					button.onclick = () => {
						search(this.cfg.searchValue);
					};
				});
				const searchContainer = h('div', { style: { textAlign: 'end' } }, [button]);

				panel.body.append(h('div', [content, searchContainer]));
			}
		}),
		edgeMinimize: new Script({
			name: '边缘最小化图标模式',
			matches: [['所有页面', /.*/]],
			hideInPanel: true,
			// onactive 立即检测吸附状态，避免刷新后吸附激活过慢
			onactive() {
				if (self !== top) {
					return;
				}
				initEdgeMinimize();
			}
		}),
		hack: new Script({
			name: '页面复制粘贴限制解除',
			matches: [['所有页面', /.*/]],
			hideInPanel: true,
			onactive() {
				enableCopy([document, document.body]);
			},
			oncomplete() {
				enableCopy([document, document.body]);
				insertCopyableStyle();
				setTimeout(() => {
					enableCopy([document, document.body]);
					insertCopyableStyle();
				}, 3000);
			}
		}),
		disableDialog: new Script({
			name: '禁止弹窗',
			matches: [['所有页面', /.*/]],
			hideInPanel: true,
			priority: 1,
			onstart() {
				function disableDialog(msg: string) {
					$modal.alert({
						profile: '弹窗来自：' + location.origin,
						content: msg
					});
				}

				try {
					$gm.unsafeWindow.alert = disableDialog;
					window.alert = disableDialog;
				} catch (e) {
					console.error(e);
				}
			}
		})
	}
});

function insertCopyableStyle() {
	const style = document.createElement('style');
	style.innerHTML = `
		html * {
		  -webkit-user-select: text !important;
		  -khtml-user-select: text !important;
		  -moz-user-select: text !important;
		  -ms-user-select: text !important;
		  user-select: text !important;
		}`;

	document.head.append(style);
}

const createGuide = () => {
	const showProjectDetails = (project: Project) => {
		$modal.simple({
			title: project.name,
			width: 800,
			content: h('div', [
				h('div', [
					'运行域名：',
					...(project.domains || []).map((d) =>
						h(
							'a',
							{ href: d.startsWith('http') ? d : 'https://' + d, target: '_blank', style: { margin: '0px 4px' } },
							d
						)
					)
				]),
				h('div', '脚本列表：'),
				h(
					'ul',
					Object.keys(project.scripts)
						.sort((a, b) => (project.scripts[b].hideInPanel ? -1 : 1))
						.map((key) => {
							const script = project.scripts[key];
							return h(
								'li',
								[
									h('b', script.name),
									$ui.notes([
										h('span', ['操作面板：', script.hideInPanel ? '隐藏' : '显示']),

										[
											'运行页面：',
											h(
												'ul',
												script.matches
													.map((m) => (Array.isArray(m) ? m : (['无描述', m] as [string, string | RegExp])))
													.map((i) =>
														h('li', [
															i[0],
															'：',
															i[1] instanceof RegExp ? i[1].toString().replace(/\\/g, '').slice(1, -1) : h('span', i[1])
														])
													)
											)
										]
									])
								],
								(li) => {
									li.style.marginBottom = '12px';
								}
							);
						}),
					(ul) => {
						ul.style.padding = '12px 24px';
						ul.style.border = '1px solid #e1e1e1';
						ul.style.borderRadius = '4px';
						ul.style.maxHeight = '400px';
						ul.style.overflow = 'auto';
						ul.style.paddingLeft = '42px';
					}
				)
			])
		});
	};

	const gotoHome = h('button', { className: 'base-style-button-secondary' }, '🏡官网教程');
	gotoHome.onclick = () => window.open('https://docs.ocsjs.com', '_blank');

	const contactUs = h('button', { className: 'base-style-button-secondary' }, '🗨️交流群');
	contactUs.onclick = () => window.open('https://docs.ocsjs.com/docs/about#交流方式', '_blank');

	const changeLog = h('button', { className: 'base-style-button-secondary' }, '📄更新日志');
	changeLog.onclick = () => BackgroundProject.scripts.update.methods.showChangelog();

	const closeGuide = h('button', { className: 'base-style-button-secondary' }, '📄如何关闭脚本？');
	closeGuide.onclick = () =>
		window.open('https://docs.ocsjs.com/docs/script#%E5%85%B3%E9%97%AD%E8%84%9A%E6%9C%AC%E6%95%99%E7%A8%8B', '_blank');

	return h('div', { className: 'user-guide' }, [
		h('div', [
			h('div', { style: { marginBottom: '4px', fontWeight: 'bold' } }, [
				'✨兼容的网课平台：',
				h('span', { className: 'secondary', style: { fontWeight: 'normal' } }, '（未适配的平台将无法运行，请等待适配）')
			]),

			h(
				'div',
				{ style: { display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '400px' } },
				[CXProject, ZHSProject, ZJYProject, IcveMoocProject, ICourseProject, YKTProject].map((project) => {
					const btn = h('button', { className: 'base-style-button-secondary' }, [project.name]);
					btn.onclick = () => {
						showProjectDetails(project);
					};
					return h('span', [btn]);
				})
			)
		]),
		h('div', { style: { margin: '12px 0px' } }, [
			h('div', { style: { marginBottom: '8px', fontWeight: 'bold' } }, '🌐快捷访问：'),
			gotoHome,
			contactUs,
			changeLog,
			closeGuide
		])
	]);
};

/** 按题型区分"答案无法作答"的提示文案 */
const typeMismatchTexts: Record<string, string> = {
	single: '⚠️ 给出的答案和选项不匹配，可能是题库答案错误',
	multiple: '⚠️ 给出的答案和选项不匹配，可能是题库答案错误',
	judgement: '⚠️ 无法选择，可能是题库答案错误',
	completion: '⚠️ 给出的答案无法填入，可能是题库答案错误或者格式错误'
};

function createSearchResultAlertElement(result: SimplifyWorkResult) {
	let info: HTMLElement | null = null;
	let err = result.error || result.searchInfos.find((i) => i.error)?.error;
	if (result.requested === false && result.resolved === false) {
		info = h('div', { className: 'result-info unresolved' }, '等待搜索中... 🔍');
	} else if (err) {
		let href = '';
		if (err?.includes('is not valid JSON')) {
			err = '题库返回数据错误';
			href = 'https://docs.ocsjs.com/docs/other/FQA#tk-data-error';
		} else if (err?.includes('题库连接失败')) {
			err = '题库连接失败';
			href = 'https://docs.ocsjs.com/docs/other/FQA#tk-error';
		}
		if (href) {
			info = h('div', { className: 'result-info error' }, [
				'❌ ' + err,
				h('a', { href, target: '_blank', style: { marginLeft: '3px' } }, '解决方法?')
			]);
		} else {
			info = h('div', { className: 'result-info error' }, ['❌ ' + err]);
		}
	} else if (result.searchInfos.length === 0) {
		info = h('div', { className: 'result-info no-answer' }, '❌ 题库没搜索到答案');
	} else {
		const mismatchText = (result.type && typeMismatchTexts[result.type]) || typeMismatchTexts.single;
		info = result.finish
			? null
			: result.resolved === false
			? h('div', { className: 'result-info unresolved' }, '等待顺序答题中... ⏱️')
			: h('div', { className: 'result-info warn' }, mismatchText);
	}

	return h('div', { className: 'alert-info-wrapper' }, [info ?? h('div')]);
}
