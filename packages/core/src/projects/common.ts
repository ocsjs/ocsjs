import { getDefinedProjects } from '.';
import { Project } from '../interfaces/project';
import { Script } from '../interfaces/script';
import { getAllRawConfigs } from '../utils/common';
import cloneDeep from 'lodash/cloneDeep';
import { $model } from './init';
import { el } from '../utils/dom';
import { addConfigChangeListener } from '../utils/tampermonkey';

export const CommonProject: Project = {
	name: '通用',
	domains: [],
	scripts: [
		new Script({
			name: '使用教程',
			url: [/.*/],
			namespace: 'common.guide',
			configs: {
				notes: {
					defaultValue: ''
				},
				showGuide: { defaultValue: true, label: '显示使用教程', attrs: { type: 'checkbox' } }
			},

			oncomplete() {
				if (self === top) {
					const projectSelector = this.header?.projectSelector?.cloneNode(true) as HTMLSelectElement;
					projectSelector.style.border = '1px solid gray';
					const expandSwitcher = this.header?.expandSwitcher?.cloneNode(true) as HTMLDivElement;
					const visualSwitcher = this.header?.visualSwitcher?.cloneNode(true) as HTMLDivElement;
					const closeButton = this.header?.closeButton?.cloneNode(true) as HTMLDivElement;

					const guide = el('div', [
						el('ul', { className: 'user-guide' }, [
							el('li', [
								'OCS会根据当前的页面自动选择脚本进行运行，如果没有达到您预期的效果，则代表当前页面并没有脚本运行。',
								'以下是全部支持的网课以及包含的脚本:'
							]),
							el(
								'ul',
								getDefinedProjects().map((project) => {
									return el('li', [
										el('div', project.name),
										el(
											'ul',
											project.scripts.map((script) =>
												el(
													'li',
													{
														title: [
															'隐藏操作页面:\t' + (script.hideInPanel ? '是' : '否'),
															'在以下页面中运行:\t' + script.url.join(',')
														].join('\n')
													},
													script.name
												)
											)
										)
									]);
								})
							),
							el('li', '最后温馨提示：请将浏览器页面保持最大化，或者缩小窗口，不能最小化，可能导致脚本卡死！')
						]),
						el('hr'),
						el('ul', { className: 'user-guide' }, [
							el('li', '以下是窗口顶部菜单栏的解析:'),
							el('li', [
								projectSelector || '',
								' ',
								'菜单栏的选择框，可选择脚本操作页面，部分脚本会提供操作页面（包含脚本设置和脚本提示）。'
							]),
							el('li', [expandSwitcher || '', ' ', '可以 展开/收缩 脚本操作页面。']),
							el('li', [visualSwitcher || '', ' ', '可以 最小化/展开 窗口。']),
							el('li', [closeButton || '', ' ', closeButton?.title || ''])
						])
					]);
					this.cfg.notes = guide.outerHTML;

					if (this.cfg.showGuide) {
						$model('confirm', {
							title: '使用教程',
							content: this.panel?.notesContainer.outerHTML || '',
							confirmButtonText: '我已阅读，不再提示',
							onConfirm: () => {
								this.cfg.showGuide = false;
							}
						});
					}
				}
			}
		}),
		new Script({
			name: '开发者调试页面',
			url: [/.*/],
			configs: () => {
				const configs = cloneDeep(
					getAllRawConfigs(
						getDefinedProjects()
							.map((p) => p.scripts)
							.flat()
							.filter((s) => s.name !== '开发者调试页面')
					)
				);

				for (const key in configs) {
					if (Object.prototype.hasOwnProperty.call(configs, key)) {
						const element = configs[key];
						element.sync = true;
						element.attrs = element.attrs || {};
						element.attrs.disabled = true;
					}
				}
				return configs;
			},
			onstart() {
				for (const key in this.configs) {
					if (Object.prototype.hasOwnProperty.call(this.configs, key)) {
						addConfigChangeListener(key, (pre, curr) => {
							Reflect.set(this.cfg, key, curr);
						});
					}
				}
			}
		})
	]
};
