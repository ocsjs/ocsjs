import { definedCustomElements } from '../elements';

import { Config } from '../interfaces/config';
import { Project } from '../interfaces/project';
import { Script } from '../interfaces/script';
import { getConfig, getMatchedScripts, namespaceKey, setConfig } from '../utils/common';
import { el, enableElementDraggable, tooltip } from '../utils/dom';
import { StartConfig } from '../utils/start';
import { humpToTarget } from '../utils/string';

const InitPanelScript = new Script({
	name: '初始化页面',
	url: [/.*/],
	namespace: 'init.panel',
	hideInPanel: true,
	configs: {
		x: { defaultValue: window.innerWidth * 0.1 },
		y: { defaultValue: window.innerWidth * 0.1 },
		visual: { defaultValue: 'normal' },
		expandAll: { defaultValue: false },
		alerts: { defaultValue: '' },
		currentPanelName: { defaultValue: 'init.panel' }
	},
	onactive({ style, projects }: StartConfig) {
		/** 注册自定义元素 */
		for (const element of definedCustomElements) {
			const name = humpToTarget(element.name, '-');
			customElements.define(name, element);
		}
		const visibleProjects = projects.filter((p) => p.scripts.find((s) => !s.hideInPanel));
		/** 当前匹配到的脚本，并且面板不隐藏 */
		const matchedScripts = getMatchedScripts(projects).filter((s) => !s.hideInPanel);
		const panel = el('div');
		const container = el('container-element');

		/** 创建头部元素 */
		const createHeader = () => {
			/** 图标 */
			const logo = tooltip(
				el('img', {
					src: 'https://cdn.ocsjs.com/logo.png',
					width: 18,
					className: 'logo',
					title: '官方教程',
					onclick: () => {
						window.open('https://docs.ocsjs.com', '_blank');
					}
				})
			);
			/** 版本简介 */
			const profile = el('div', {
				className: 'profile',
				innerText: 'OCS-' + (process.env.__VERSION__ || '0')
			});

			/** 面板切换器 */
			const projectSelector = tooltip(
				el(
					'select',
					{
						className: 'project-selector',
						title: '选择脚本管理页面，当全部展开时，显示全部管理页面。',
						onchange: () => {
							this.cfg.currentPanelName = projectSelector.value;
							// 替换元素
							replaceBody();
						}
					},
					(select) => {
						for (const project of visibleProjects) {
							const scripts = getMatchedScripts([project]).filter((s) => !s.hideInPanel);
							for (const script of scripts) {
								select.append(
									el('option', {
										value: project.name + '-' + script.name,
										innerText: project.name + '-' + script.name,
										selected: project.name + '-' + script.name === this.cfg.currentPanelName
									})
								);
							}
						}
					}
				)
			);

			/** 窗口是否最小化 */
			const isMinimize = () => this.cfg.visual === 'minimize';
			/** 窗口状态切换按钮 */
			const visualSwitcher = tooltip(
				el('div', {
					className: 'switch ',
					title: isMinimize() ? '展开窗口' : '最小化窗口',
					innerText: isMinimize() ? '□' : '-',
					onclick: () => {
						this.cfg.visual = isMinimize() ? 'normal' : 'minimize';
						visualSwitcher.title = isMinimize() ? '展开窗口' : '最小化窗口';
						visualSwitcher.innerText = isMinimize() ? '□' : '-';
					}
				})
			);

			/** 是否展开所有脚本 */
			const isExpandAll = () => this.cfg.expandAll === true;
			/** 脚本切换按钮 */
			const expandSwitcher = tooltip(
				el('div', {
					className: 'panel-switch',
					title: isExpandAll() ? '收缩脚本' : '展开脚本',
					innerText: isExpandAll() ? '-' : '≡',
					onclick: () => {
						this.cfg.expandAll = !isExpandAll();
						expandSwitcher.title = isExpandAll() ? '收缩脚本' : '展开脚本';
						expandSwitcher.innerText = isExpandAll() ? '-' : '≡';
						// 替换元素
						replaceBody();
					}
				})
			);

			/** 窗口关闭按钮 */
			const closeButton = tooltip(
				el('div', {
					className: 'close  ',
					innerText: 'x',
					title: '关闭窗口（不会影响脚本运行，连续点击三次页面可以重新唤出）',
					onclick: () => (this.cfg.visual = 'close')
				})
			);

			return { profile, projectSelector, logo, expandSwitcher, visualSwitcher, closeButton };
		};

		/** 创建内容 */
		const createBody = () => {
			const scriptContainers = [];
			for (const project of visibleProjects.sort((a, b) =>
				a.scripts.some((s) => a.name + '-' + s.name === this.cfg.currentPanelName) ? -1 : 1
			)) {
				const scripts = getMatchedScripts([project]);

				for (const script of scripts) {
					const scriptContainer = el('div', { className: 'script-panel' });
					// 创建提示板块
					const notesContainer = el('div', { className: 'notes card', title: '使用提示' });
					// 创建设置板块
					const configsContainer = el('div', { className: 'configs card', title: '脚本设置' });
					const configsBody = el('div', { className: 'configs-body' });

					notesContainer.append(...createNotes(script.notes || []));
					configsBody.append(...createConfigs(script.namespace, script.configs || {}));
					configsContainer.append(configsBody);

					scriptContainer.append(
						el('div', {
							className: 'separator',
							textContent: this.cfg.expandAll ? project.name + '-' + script.name : script.name
						})
					);

					notesContainer.childElementCount && scriptContainer.append(notesContainer);
					configsBody.childElementCount && scriptContainer.append(configsContainer);
					scriptContainers.push(scriptContainer);
					if (!this.cfg.expandAll) {
						return scriptContainers;
					}
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
				// 三击重置位置
				if (e.detail === 3) {
					container.style.top = e.y + 'px';
					container.style.left = e.x + 'px';
					this.cfg.x = e.x;
					this.cfg.y = e.y;
					this.cfg.visual = this.cfg.visual === 'close' ? 'normal' : this.cfg.visual;
				}
			});
			// 跨域监听状态切换
			this.onConfigChange('visual', (pre, curr) => visual(curr));
			visual(this.cfg.visual);
		};

		/** 替换 body 中的内容 */
		const replaceBody = () => {
			container.body.replaceChildren(...createBody());
		};
		/** 创建设置区域 */

		function createConfigs(namespace: string | undefined, configs: Record<string, Config<any>>) {
			const elements = [];
			for (const key in configs) {
				if (Object.prototype.hasOwnProperty.call(configs, key)) {
					const cfg = configs[key];
					if (cfg.label) {
						const element = el('config-element', {
							key: namespaceKey(namespace, key),
							tag: cfg.tag,
							sync: cfg.sync,
							attrs: cfg.attrs,
							_onload: cfg.onload
						});
						element.label.textContent = cfg.label;
						elements.push(element);
					}
				}
			}

			return elements;
		}
		/** 创建内容板块 */
		function createNotes(notes: string[]) {
			const elements = [];
			for (const note of notes) {
				elements.push(el('div', { textContent: note }));
			}
			return elements;
		}

		/** 在顶级页面显示操作面板 */
		if (matchedScripts.length !== 0 && self === top) {
			const { profile, projectSelector, logo, expandSwitcher, visualSwitcher, closeButton } = createHeader();

			// 创建样式元素
			container.append(el('style', { textContent: style || '' }));
			container.header.append(profile, projectSelector, logo, expandSwitcher, visualSwitcher, closeButton);
			replaceBody();
			// 插入操作面板到页面
			panel.attachShadow({ mode: 'closed' }).append(container);
			document.body.appendChild(panel);
			handlePosition();
		}

		handleVisible();
	}
});

export const InitProject: Project = {
	name: '初始化程序',
	domains: [],
	scripts: [InitPanelScript]
};

export function $alert(message: string) {
	const key = namespaceKey(InitPanelScript.namespace, 'alerts');
	const value = getConfig(key);
	setConfig(key, value + message + '\n');
}
