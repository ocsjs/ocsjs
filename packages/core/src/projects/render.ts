import { definedCustomElements } from '../elements';
import { MessageElement } from '../elements/message';
import { ModelElement } from '../elements/model';

import { cors } from '../interfaces/cors';
import { Project } from '../interfaces/project';
import { Script } from '../interfaces/script';
import { $ } from '../utils/common';
import { $creator } from '../utils/creator';
import { el, enableElementDraggable } from '../utils/dom';
import { $elements } from '../utils/elements';
import { StartConfig } from '../utils/start';
import { $string } from '../utils/string';
import { $gm } from '../utils/tampermonkey';

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
	disableWrapperCloseable?: boolean;
	title?: ModelElement['title'];
	/** 伴随系统通知一起弹出 */
	notification?: boolean;
	notificationOptions?: {
		important?: boolean;
		duration?: number;
	};
};

const RenderScript = new Script({
	name: '悬浮窗',
	url: [/.*/],
	namespace: 'render.panel',
	configs: {
		x: { defaultValue: window.innerWidth * 0.1 },
		y: { defaultValue: window.innerWidth * 0.1 },
		visual: { defaultValue: 'normal' },
		expandAll: { defaultValue: false },
		currentPanelName: { defaultValue: 'render.panel' },
		fontsize: {
			label: '字体大小（像素）',
			attrs: { type: 'number', min: 10, max: 36, step: 1 },
			defaultValue: 14
		},
		switchPoint: {
			label: '窗口连续点击切换点（次数）',
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
	onactive({ style, projects }: StartConfig) {
		/** 注册自定义元素 */
		for (const element of definedCustomElements) {
			const name = $string.humpToTarget(element.name, '-');
			customElements.define(name, element);
		}

		/** 当前匹配到的脚本，并且面板不隐藏 */
		const matchedScripts = $.getMatchedScripts(projects, [location.href]).filter((s) => !s.hideInPanel);

		/** 根元素 */
		const container = el('container-element');

		/** 创建头部元素 */
		const initHeader = (urls: string[] = $gm.getValue('_urls_', [location.href])) => {
			container.header.replaceChildren();
			/** 图标 */
			container.header.logo = $creator.tooltip(
				el('img', {
					src: $gm.getInfos().script.icon || '',
					width: 18,
					className: 'logo',
					title: '官方教程',
					onclick: () => {
						window.open($gm.getInfos().script.homepage || '', '_blank');
					}
				})
			);

			/** 版本简介 */
			container.header.profile = $creator.tooltip(
				el(
					'div',
					{ className: 'profile', title: '菜单栏（可拖动区域）' },
					'OCS-' + ($gm.getInfos().script.version || '0')
				)
			);

			/** 面板切换器 */
			const projectSelector = el(
				'select',
				{
					onchange: () => {
						this.cfg.currentPanelName = projectSelector.value;
					}
				},
				(select) => {
					for (const project of projects.sort(({ level: a = 0 }, { level: b = 0 }) => b - a)) {
						const scripts = $.getMatchedScripts([project], urls)
							.filter((s) => !s.hideInPanel)
							.sort(({ level: a = 0 }, { level: b = 0 }) => b - a);
						if (scripts.length) {
							const group = el('optgroup', { label: project.name });
							for (const script of scripts) {
								group.append(
									el('option', {
										value: project.name + '-' + script.name,
										innerText: script.name,
										selected: project.name + '-' + script.name === this.cfg.currentPanelName
									})
								);
							}
							select.append(group);
						}
					}
				}
			);
			const opt = el('option');
			const updatePanelProjectName = () => (opt.innerText = projectSelector.value.split('-')[0] + '-');
			/** 仅展示名字，不具备选择功能 */
			const projectNameEl = el('select', [opt], (sel) => {
				sel.disabled = true;
			});
			projectSelector.addEventListener('change', updatePanelProjectName);
			updatePanelProjectName();
			const projectSelectorDiv = $creator.tooltip(
				el(
					'div',
					{
						className: ['project-selector', this.cfg.expandAll ? 'expand-all' : ''].join(' '),
						title: '点击选择脚本操作页面，部分脚本会提供操作页面（包含脚本设置和脚本提示）。'
					},
					[projectNameEl, projectSelector]
				)
			);

			container.header.projectSelector = projectSelectorDiv;

			/** 是否展开所有脚本 */
			const isExpandAll = () => this.cfg.expandAll === true;
			/** 脚本切换按钮 */
			const expandSwitcher = $creator.tooltip(
				el('div', {
					className: 'panel-switch',
					title: isExpandAll() ? '收缩脚本' : '展开脚本',
					innerText: isExpandAll() ? '-' : '≡',
					onclick: () => {
						this.cfg.expandAll = !isExpandAll();
						expandSwitcher.title = this.cfg.expandAll ? '收缩脚本' : '展开脚本';
						expandSwitcher.innerText = this.cfg.expandAll ? '-' : '≡';
						projectSelectorDiv.classList.toggle('expand-all');
						// 替换元素
						replaceBody();
					}
				})
			);
			container.header.expandSwitcher = expandSwitcher;

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
					onclick: () => (this.cfg.visual = 'close')
				})
			);

			container.header.append(
				container.header.profile || '',
				container.header.projectSelector || '',
				container.header.logo || '',
				container.header.expandSwitcher || '',
				container.header.visualSwitcher || '',
				container.header.closeButton || ''
			);
		};

		const createScriptPanel = (projectName: string, script: Script) => {
			// 创建脚本面板
			const scriptPanel = el('script-panel-element', {
				name: this.cfg.expandAll ? projectName + '-' + script.name : script.name
			});

			// 监听提示内容改变
			script.onConfigChange('notes', (pre, curr) => {
				scriptPanel.notesContainer.innerHTML = script.cfg.notes || '';
			});
			// 注入 panel 对象 ， 脚本可修改 panel 对象进行面板的内容自定义
			script.panel = scriptPanel;

			scriptPanel.notesContainer.innerHTML = script.cfg.notes || '';
			const els = $creator.configs(script.namespace, script.configs || {});
			const elList = [];
			for (const key in els) {
				if (Object.prototype.hasOwnProperty.call(els, key)) {
					elList.push(els[key]);
				}
			}

			scriptPanel.configsBody.append(...elList);
			scriptPanel.configsContainer.append(scriptPanel.configsBody);

			return scriptPanel;
		};

		/** 创建内容 */
		const createBody = (urls: string[]) => {
			const scriptContainers = [];
			const allScript: Script[] = [];

			for (const project of projects) {
				const scripts = $.getMatchedScripts([project], urls).filter((s) => !s.hideInPanel);
				allScript.push(...scripts);

				const initPanelAndScript = (script: Script) => {
					const panel = createScriptPanel(project.name, script);
					script.projectName = project.name;
					script.panel = panel;
					script.header = container.header;
					return panel;
				};
				for (const script of scripts) {
					scriptContainers.push(initPanelAndScript(script));
				}
			}

			if (!this.cfg.expandAll) {
				const index = allScript.findIndex((s) => s.projectName + '-' + s.name === this.cfg.currentPanelName);
				const targetIndex = index === -1 ? 0 : index;
				// 执行重新渲染钩子
				allScript[targetIndex].onrender?.({ panel: scriptContainers[targetIndex], header: container.header });
				allScript[targetIndex].emit('render', { panel: scriptContainers[targetIndex], header: container.header });
				return [scriptContainers[targetIndex]];
			}
			// 如果全部展开
			for (const script of allScript) {
				if (script.panel) {
					script.onrender?.({ panel: script.panel, header: container.header });
				}
			}

			return scriptContainers;
		};

		/** 处理面板位置 */
		const handlePosition = () => {
			container.style.top = this.cfg.y + 'px';
			container.style.left = this.cfg.x + 'px';
			const positionHandler = () => {
				this.cfg.x = container.offsetLeft;
				this.cfg.y = container.offsetTop;
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
		const replaceBody = (urls: string[] = $gm.getValue('_urls_', [location.href])) => {
			container.body.replaceChildren(...createBody(urls));
		};
		/** 创建设置区域 */

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

		const render = () => {
			initHeader();
			replaceBody();

			$gm.addConfigChangeListener('_urls_', (pre, curr) => {
				initHeader(curr);
				replaceBody(curr);
			});

			// 监听变化，重新渲染
			this.onConfigChange('currentPanelName', render);
		};

		const onFontsizeChange = () => {
			container.style.font = `${this.cfg.fontsize}px  Menlo, Monaco, Consolas, 'Courier New', monospace`;
		};

		/** 在顶级页面显示操作面板 */
		if (matchedScripts.length !== 0 && self === top) {
			// 创建样式元素
			container.append(el('style', {}, style || ''), $elements.messageContainer);
			render();
			// 随机位置插入操作面板到页面
			$elements.root.append(container);
			const target = document.body.children[random(0, document.body.children.length - 1)];
			target.after($elements.panel);
			initModelSystem();
			handlePosition();

			onFontsizeChange();
			this.onConfigChange('fontsize', onFontsizeChange);
		}

		handleVisible();
	}
});

export const RenderProject = Project.create({
	name: '渲染',
	domains: [],
	scripts: {
		render: RenderScript
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

function random(min: number, max: number) {
	return Math.round(Math.random() * (max - min)) + min;
}
