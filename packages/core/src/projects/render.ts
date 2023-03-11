import { ScriptPanelElement, definedCustomElements } from '../elements';
import { MessageElement } from '../elements/message';
import { ModelElement } from '../elements/model';
import { cors } from '../interfaces/cors';
import { Project } from '../interfaces/project';
import { Script } from '../interfaces/script';
import { $ } from '../utils/common';
import { $const } from '../utils/const';
import { $creator } from '../utils/creator';
import { el, enableElementDraggable } from '../utils/dom';
import { $elements } from '../utils/elements';
import { StartConfig } from '../utils/start';
import { $store } from '../utils/store';
import { $gm } from '../utils/tampermonkey';
import debounce from 'lodash/debounce';

export type ModelAttrs = Pick<
	ModelElement,
	| 'content'
	| 'onConfirm'
	| 'onCancel'
	| 'onClose'
	| 'cancelButtonText'
	| 'confirmButtonText'
	| 'placeholder'
	| 'width'
	| 'cancelButton'
	| 'confirmButton'
	| 'inputDefaultValue'
> & {
	/** 取消生成窗口的关闭按钮 */
	disableWrapperCloseable?: boolean;
	/** 弹窗标题 */
	title?: ModelElement['title'];
	/** 伴随系统通知一起弹出 */
	notification?: boolean;
	notificationOptions?: {
		/** 是否为重要通知 */
		important?: boolean;
		/** 消息显示时间（秒） */
		duration?: number;
	};
};

/**
 * 内置的渲染脚本，包含在内置的 RenderProject 类中。搭配 start 函数进行整个脚本的悬浮窗构成创建
 *
 * 可以不用悬浮窗也能执行脚本的生命周期，但是不会执行 render 这个生命周期
 */
const RenderScript = new Script({
	name: '悬浮窗',
	url: [['所有', /.*/]],
	namespace: 'render.panel',
	configs: {
		x: { defaultValue: window.innerWidth * 0.1 },
		y: { defaultValue: window.innerWidth * 0.1 },

		/**
		 * - minimize: 最小化
		 * - close: 关闭
		 * - normal: 正常
		 */
		visual: { defaultValue: 'normal' as 'minimize' | 'normal' | 'close' },
		// 首次关闭时警告
		firstCloseAlert: {
			defaultValue: true
		},
		fontsize: {
			label: '字体大小（像素）',
			attrs: { type: 'number', min: 12, max: 24, step: 1 },
			defaultValue: 14
		},
		switchPoint: {
			label: '窗口显示连点（次数）',
			attrs: {
				type: 'number',
				min: 3,
				max: 10,
				step: 1,
				title: '设置当连续点击屏幕 N 次时，可以进行面板的 隐藏/显示 切换，默认连续点击屏幕三下'
			},
			defaultValue: 3
		}
	},

	async onactive({ style, projects }: StartConfig) {
		/** 加载自定义元素 */
		$.loadCustomElements(definedCustomElements);

		/** 当前匹配到的脚本，并且面板不隐藏 */
		const matchedScripts = $.getMatchedScripts(projects, [location.href]).filter((s) => !s.hideInPanel);

		/** 根元素 */
		const container = el('container-element');

		/** 创建头部元素 */
		const initHeader = (urls: string[], currentPanelName: string) => {
			const infos = $gm.getInfos();
			/** 图标 */
			container.header.logo = $creator.tooltip(
				el('img', {
					src: infos?.script.icon || 'https://cdn.ocsjs.com/logo.png',
					width: 18,
					className: 'logo',
					title: '官方教程',
					onclick: () => {
						window.open(infos?.script.homepage || 'https://docs.ocsjs.com', '_blank');
					}
				})
			);

			/** 版本简介 */
			container.header.profile = $creator.tooltip(
				el(
					'div',
					{ className: 'profile', title: '菜单栏（可拖动区域）' },
					`OCS${infos ? '-' : ''}${infos?.script.version || ''}`
				)
			);

			/** 面板切换器 */
			const projectSelector = el(
				'select',
				{
					id: 'project-selector',
					onchange: async () => {
						await $store.setTab($const.TAB_CURRENT_PANEL_NAME, projectSelector.value);
					}
				},
				async (select) => {
					const sortedProjects = projects.sort(({ level: a = 0 }, { level: b = 0 }) => b - a);

					for (const project of sortedProjects) {
						const scripts = $.getMatchedScripts([project], urls)
							.filter((s) => !s.hideInPanel)
							.sort(({ level: a = 0 }, { level: b = 0 }) => b - a);
						if (scripts.length) {
							const group = el('optgroup', { label: project.name });

							const options = scripts.map((script, i) =>
								el('option', {
									value: project.name + '-' + script.name,
									label: script.name,
									selected: isCurrentPanel(project.name, script, currentPanelName)
								})
							);

							group.append(...options);
							select.append(group);
						}
					}
				}
			);
			const projectSelectorDiv = $creator.tooltip(
				el(
					'div',
					{
						className: 'project-selector',
						title: '点击选择脚本操作页面，部分脚本会提供操作页面（包含脚本设置和脚本提示）。'
					},
					[projectSelector]
				)
			);

			container.header.projectSelector = projectSelectorDiv;

			/** 窗口是否最小化 */
			const isMinimize = () => this.cfg.visual === 'minimize';
			/** 窗口状态切换按钮 */
			const visualSwitcher = $creator.tooltip(
				el('div', {
					className: 'switch ',
					title: isMinimize() ? '点击展开窗口' : '点击最小化窗口',
					innerText: isMinimize() ? '□' : '-',
					onclick: () => {
						this.cfg.visual = isMinimize() ? 'normal' : 'minimize';
						visualSwitcher.title = isMinimize() ? '点击展开窗口' : '点击最小化窗口';
						visualSwitcher.innerText = isMinimize() ? '□' : '-';
					}
				})
			);
			container.header.visualSwitcher = visualSwitcher;

			/** 窗口关闭按钮 */
			container.header.closeButton = $creator.tooltip(
				el('div', {
					className: 'close  ',
					innerText: 'x',
					title: '点击关闭窗口（不会影响脚本运行，连续点击三次页面任意位置可以重新唤出窗口）',
					onclick: () => {
						if (this.cfg.firstCloseAlert) {
							$model('confirm', {
								content: $creator.notes([
									'关闭脚本页面后，快速点击页面三下（可以在悬浮窗设置中调整次数）即可重新显示脚本。如果三下无效，可以尝试删除脚本重新安装。',
									'请确认是否关闭。（此后不再显示此弹窗）'
								]),
								onConfirm: () => {
									this.cfg.visual = 'close';
									this.cfg.firstCloseAlert = false;
								}
							});
						} else {
							this.cfg.visual = 'close';
						}
					}
				})
			);

			container.header.replaceChildren();
			container.header.append(
				container.header.profile || '',
				container.header.projectSelector || '',
				container.header.logo || '',
				container.header.visualSwitcher || '',
				container.header.closeButton || ''
			);
		};

		const initPanelAndScript = (projectName: string, script: Script) => {
			const panel = $creator.scriptPanel(script, { projectName });
			script.projectName = projectName;
			script.panel = panel;
			script.header = container.header;
			return panel;
		};

		/** 创建内容 */
		const createBody = async (urls: string[], currentPanelName: string) => {
			const list: { script: Script; panel: ScriptPanelElement }[] = [];

			for (const project of projects) {
				const scripts = $.getMatchedScripts([project], urls).filter((s) => !s.hideInPanel);
				for (const script of scripts) {
					list.push({ script, panel: initPanelAndScript(project.name, script) });
				}
			}

			const index = list.findIndex((i) => isCurrentPanel(i.script.projectName, i.script, currentPanelName));
			const targetIndex = index === -1 ? 0 : index;

			if (list[targetIndex]) {
				return [list[targetIndex]];
			} else {
				// 如果第一个存在
				if (list[0]) {
					return [list[0]];
				} else {
					return [
						{
							script: RenderProject.scripts.render,
							panel: initPanelAndScript(RenderProject.name, RenderProject.scripts.render)
						}
					] as { script: Script; panel: ScriptPanelElement }[];
				}
			}
		};

		/** 处理面板位置 */
		const handlePosition = () => {
			if (this.cfg.x > document.documentElement.clientWidth || this.cfg.x < 0) {
				this.cfg.x = 10;
				this.cfg.y = 10;
			}

			if (this.cfg.y > document.documentElement.clientHeight || this.cfg.y < 0) {
				this.cfg.x = 10;
				this.cfg.y = 10;
			}

			container.style.left = this.cfg.x + 'px';
			container.style.top = Math.max(this.cfg.y, 10) + 'px';
			const positionHandler = () => {
				this.cfg.x = container.offsetLeft;
				this.cfg.y = Math.max(container.offsetTop, 10);
			};
			enableElementDraggable(container.header, container, positionHandler);
		};

		/** 处理面板可视状态 */
		const handleVisible = () => {
			/** 切换面板状态 */
			const visual = (value: string) => {
				container.className = '';

				// 最小化
				if (value === 'minimize') {
					container.classList.add('minimize');
				}
				// 关闭
				else if (value === 'close') {
					container.classList.add('close');
				}
				// 展开
				else {
					container.classList.add('normal');
				}
			};
			window.addEventListener('click', (e) => {
				// 三击以上重置位置
				if (e.detail === Math.max(this.cfg.switchPoint, 3)) {
					container.style.top = e.y + 'px';
					container.style.left = e.x + 'px';
					this.cfg.x = e.x;
					this.cfg.y = e.y;
					this.cfg.visual = this.cfg.visual === 'close' ? 'normal' : this.cfg.visual;
				}
			});
			// 跨域监听状态切换
			this.onConfigChange('visual', (curr) => visual(curr));
			visual(this.cfg.visual);
		};

		/** 替换 body 中的内容 */
		const renderBody = async (urls: string[], currentPanelName: string) => {
			const list = await createBody(urls, currentPanelName);

			container.body.replaceChildren(...list.map((i) => i.panel));

			// 触发 onrender 钩子
			const scripts = list.map((i) => i.script);

			const index = scripts.findIndex((s) => isCurrentPanel(s.projectName, s, currentPanelName));

			const script = scripts[index === -1 ? 0 : index];
			if (script?.panel) {
				// 执行重新渲染钩子
				script.onrender?.({ panel: script.panel, header: container.header });
				script.emit('render', { panel: script.panel, header: container.header });
			}
		};

		/** 初始化模态框系统 */
		const initModelSystem = () => {
			// 添加 models 监听队列
			cors.on('model', async ([type, _attrs]) => {
				return new Promise((resolve, reject) => {
					const attrs = _attrs as ModelAttrs;
					attrs.onCancel = () => resolve('');
					attrs.onConfirm = resolve;
					attrs.onClose = resolve;
					$model(type, attrs);
				});
			});
		};

		const onFontsizeChange = () => {
			container.style.font = `${this.cfg.fontsize}px  Menlo, Monaco, Consolas, 'Courier New', monospace`;
		};

		const rerender = (urls: string[], currentPanelName: string) => {
			initHeader(urls, currentPanelName);
			renderBody(urls, currentPanelName);
		};

		/** 在顶级页面显示操作面板 */
		if (matchedScripts.length !== 0 && self === top) {
			// 创建样式元素
			container.append(el('style', {}, style || ''), $elements.messageContainer);
			// 防止浏览器不兼容，如果兼容的话会自动替换此文案
			container.body.append(
				el('div', { className: 'card' }, [
					$creator.notes([
						'OCS警告 : ',
						'当前浏览器版本过低或者不兼容，请下载其他浏览器，',
						'例如谷歌浏览器或者微软浏览器。'
					])
				])
			);
			$elements.root.append(container);
			// 随机位置插入操作面板到页面
			document.body.children[$.random(0, document.body.children.length - 1)].after($elements.panel);

			(async () => {
				const urls = await $store.getTab($const.TAB_URLS);
				const currentPanelName = await $store.getTab($const.TAB_CURRENT_PANEL_NAME);

				rerender(urls || [], currentPanelName || '');
			})();

			// 初始化模态框系统
			initModelSystem();
			// 处理面板位置
			handlePosition();
			onFontsizeChange();

			/** 使用 debounce 避免页面子 iframe 刷新过多 */
			$store.addTabChangeListener(
				$const.TAB_URLS,
				debounce(async (urls: string[] = [location.href]) => {
					const currentPanelName = await $store.getTab($const.TAB_CURRENT_PANEL_NAME);
					rerender(urls, currentPanelName);
				}, 2000)
			);

			$store.addTabChangeListener($const.TAB_CURRENT_PANEL_NAME, async (currentPanelName) => {
				const urls = (await $store.getTab($const.TAB_URLS)) || [location.href];
				rerender(urls, currentPanelName);
			});
			this.onConfigChange('fontsize', onFontsizeChange);
		}

		handleVisible();
	}
});

/**
 * 创建一个模态框代替原生的 alert, confirm, prompt
 */
export function $model(type: ModelElement['type'], attrs: ModelAttrs) {
	if (self === top) {
		const {
			disableWrapperCloseable,
			onConfirm,
			onCancel,
			onClose,
			notification: notify,
			notificationOptions,
			..._attrs
		} = attrs;

		if (notify) {
			$gm.notification(
				typeof _attrs.content === 'string' ? _attrs.content : _attrs.content.innerText,
				notificationOptions
			);
		}

		const wrapper = el('div', { className: 'model-wrapper' }, (wrapper) => {
			const model = el('model-element', {
				async onConfirm(val) {
					const isClose: any = await onConfirm?.apply(model, [val]);
					if (isClose !== false) {
						wrapper.remove();
					}

					return isClose;
				},
				onCancel() {
					onCancel?.apply(model);
					wrapper.remove();
				},
				onClose(val) {
					onClose?.apply(model, [val]);
					wrapper.remove();
				},
				type,
				..._attrs
			});
			wrapper.append(model);

			model.addEventListener('click', (e) => {
				e.stopPropagation();
			});
			if (!disableWrapperCloseable) {
				/** 点击遮罩层关闭模态框 */
				wrapper.addEventListener('click', () => {
					onClose?.apply(model);
					wrapper.remove();
				});
			}
		});

		$elements.root.append(wrapper);

		return wrapper;
	} else {
		cors.emit('model', [type, attrs], (args, remote) => {
			if (args) {
				attrs.onConfirm?.(args);
			} else {
				attrs.onCancel?.();
			}
		});
	}
}

/**
 * 消息推送
 */
export function $message(
	type: MessageElement['type'],
	attrs: Pick<MessageElement, 'duration' | 'onClose' | 'content' | 'closeable'>
) {
	const message = el('message-element', { type, ...attrs });
	$elements.messageContainer.append(message);
	return message;
}

/**
 * 内置渲染工程，包含主要悬浮窗构建脚本 RenderScript
 *
 * 使用 start 函数进行调用
 *
 * 可以帮助其他工程进行页面构建，如果不引用，则不会出现悬浮窗已经设置表单区域。
 *
 * @example
 *
 * OCS.start({
 * 		style: 'xxx',
 * 		projects: [OCS.RenderProject, ...其他工程]
 * })
 *
 */
export const RenderProject = Project.create({
	name: '渲染',
	domains: [],
	scripts: {
		render: RenderScript
	}
});

/** 判断这个脚本是否为当前显示页面 */
function isCurrentPanel(projectName: string | undefined, script: Script, currentPanelName: string) {
	return projectName + '-' + script.name === currentPanelName || script.namespace === currentPanelName;
}
