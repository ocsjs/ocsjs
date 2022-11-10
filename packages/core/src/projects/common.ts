import { getDefinedProjects } from '.';
import { Project } from '../interfaces/project';
import { Script } from '../interfaces/script';
import { getAllRawConfigs } from '../utils/common';
import cloneDeep from 'lodash/cloneDeep';
import { $model } from './init';
import { el } from '../utils/dom';
import { getValue, notification, setValue } from '../utils/tampermonkey';
import { parseAnswererWrappers } from '../core/utils/common';
import { AnswererWrapper } from '../core/worker/answer.wrapper.handler';

export const CommonProject: Project = {
	name: '通用',
	domains: [],
	scripts: [
		new Script({
			name: '全局设置',
			url: [/.*/],
			namespace: 'common.settings',
			configs: {
				notification: {
					label: '开启系统通知',
					defaultValue: true,
					attrs: { title: '允许脚本发送系统通知（在电脑屏幕右侧显示通知弹窗）。', type: 'checkbox' }
				},
				notificationSilent: {
					label: '开启通知声音',
					defaultValue: false,
					attrs: { title: '发送”叮“的声音提示', type: 'checkbox' }
				},
				answererWrappers: {
					defaultValue: []
				},

				answererWrappersButton: {
					label: '题库配置',
					defaultValue: '点击配置',
					attrs: {
						type: 'button'
					},
					onload() {
						this.onclick = () => {
							const aw: any[] = getValue('common.settings.answererWrappers');
							const list = el('div', [
								el('div', aw.length ? '以下是已经解析过的题库配置:' : ''),
								...createAnswererWrapperList(aw)
							]);
							$model('prompt', {
								content: el('div', ['具体的题库配置，请点击上方菜单栏的官网按钮查看 "自动答题教程"。', list]),
								placeholder: aw.length ? '重新输入' : '输入题库配置',
								cancelButton: el('button', {
									className: 'model-cancel-button',
									innerText: '清空题库配置',
									onclick() {
										list.remove();
										setValue('common.settings.answererWrappers', []);
									}
								}),
								async onConfirm(value) {
									if (value) {
										try {
											const aw = await parseAnswererWrappers(value);
											setValue('common.settings.answererWrappers', aw);
											$model('alert', {
												content: el('div', [
													el('div', '配置成功，打开具有答题脚本的页面后即可自动答题，解析到的题库如下所示:'),
													...createAnswererWrapperList(aw)
												])
											});
										} catch (e: any) {
											$model('alert', {
												content: el('div', [el('div', '解析失败，原因如下 :'), el('div', e.message)])
											});
										}
									} else {
										$model('alert', {
											content: el('div', '不能为空！')
										});
									}
								}
							});
						};
					}
				}
			},
			onactive() {
				this.onConfigChange('notification', (pre, curr) => {
					if (curr) {
						notification('您已开启系统通知，如果脚本有重要情况需要处理，则会发起通知提示您。', {
							duration: 5
						});
					}
				});
			}
		}),
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
					const logo = this.header?.logo?.cloneNode(true) as HTMLDivElement;
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
							el('li', [logo || '', ' ', '点击查看官网教程']),
							el('li', [expandSwitcher || '', ' ', '可以 展开/收缩 脚本操作页面。']),
							el('li', [visualSwitcher || '', ' ', '可以 最小化/展开 窗口。']),
							el('li', [closeButton || '', ' ', closeButton?.title || closeButton.getAttribute('data-title') || ''])
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
			onstart() {}
		})
	]
};

function createAnswererWrapperList(aw: AnswererWrapper[]) {
	return aw.map((item) =>
		el(
			'details',
			[
				el('summary', [item.name]),
				el('ul', [
					el('li', ['名字\t', item.name]),
					el('li', ['官网\t', item.homepage || '无']),
					el('li', ['接口\t', item.url]),
					el('li', ['请求方法\t', item.method]),
					el('li', ['请求类型\t', item.type]),
					el('li', ['请求头\t', JSON.stringify(item.headers, null, 4) || '无']),
					el('li', ['请求体\t', JSON.stringify(item.data, null, 4) || '无'])
				])
			],
			(details) => {
				details.style.paddingLeft = '12px';
			}
		)
	);
}
