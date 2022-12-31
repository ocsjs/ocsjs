import { ConfigElement } from '../elements/config';
import { Config } from '../interfaces/config';
import { Project } from '../interfaces/project';
import { Script } from '../interfaces/script';
import { sleep } from '../utils/common';
import { $creator } from '../utils/creator';
import { $$el, $el, el } from '../utils/dom';

import { getValue, unsafeWindow } from '../utils/tampermonkey';
import { $message, $model } from './init';

export const CXProject: Project = {
	name: '超星学习通',
	level: 99,
	domains: ['chaoxing.com'],
	scripts: [
		new Script({
			name: '课程学习',
			namespace: 'cx.study',
			url: []
		}),
		new Script({
			name: '章节提示',
			namespace: 'cx.chapter',
			url: [/\/mooc2-ans\/mycourse\/studentcourse/],
			level: 9,
			configs: {
				notes: { defaultValue: '请点击任意章节进入课程。' },
				autoStudy: {
					label: '5秒后自动进入课程',
					defaultValue: true,
					attrs: { type: 'checkbox' }
				}
			},
			oncomplete() {
				const run = () => {
					if (this.cfg.autoStudy) {
						this.cfg.notes = '请点击任意章节进入课程，5秒后自动进入。';
						const list = $$el('.catalog_task .catalog_jindu');
						setTimeout(() => {
							if (list.length) {
								list[0].click();
							} else {
								this.cfg.notes = '全部任务已完成！';
								$model('alert', {
									content: '全部任务已完成！',
									notification: true,
									notificationOptions: { important: true, duration: 0 }
								});
							}
						}, 5000);
					}
				};
				run();
				this.onConfigChange('autoStudy', run);
			}
		}),
		new Script({
			name: '登录脚本',
			url: [/passport2.chaoxing.com\/login/],
			level: 9,
			namespace: 'cx.login',
			configs: {
				notes: {
					defaultValue: el('ul', [
						el('li', '脚本会自动输入账号密码，但是需要手动填写验证码。'),
						el('li', '脚本用于辅助软件登录，如不想使用可直接关闭。')
					]).outerHTML
				},
				disable: {
					label: '关闭此脚本',
					defaultValue: false,
					attrs: { type: 'checkbox' }
				},
				type: {
					label: '登录类型',
					tag: 'select',
					defaultValue: 'phone' as 'phone' | 'id',
					onload() {
						this.append(
							...$creator.selectOptions(this.getAttribute('value') || '', [
								['phone', '手机号登录'],
								['id', '学号登录']
							])
						);
					}
				}
			},
			onrender({ panel }) {
				let els: Record<string, ConfigElement<any>>;
				/** 监听更改 */
				this.onConfigChange('type', () => {
					for (const key in els) {
						if (Object.prototype.hasOwnProperty.call(els, key)) {
							els[key].remove();
						}
					}
					// 删除后重新渲染
					render();
				});

				const render = () => {
					/** 动态创建设置 */
					const passwordConfig: Config = { label: '密码', defaultValue: '', attrs: { type: 'password' } };
					if (this.cfg.type === 'phone') {
						els = $creator.configs('cx.login', {
							phone: { label: '手机', defaultValue: '' },
							password: passwordConfig
						});
					} else {
						els = $creator.configs('cx.login', {
							school: { label: '学校', defaultValue: '' },
							id: { label: '学号', defaultValue: '' },
							password: passwordConfig
						});
					}

					for (const key in els) {
						if (Object.prototype.hasOwnProperty.call(els, key)) {
							panel.configsBody.append(els[key]);
						}
					}
				};

				render();
			},
			oncomplete() {
				if (!this.cfg.disable) {
					const id = setTimeout(async () => {
						const phoneLogin = $el('#back');
						const idLogin = $el('#otherlogin');
						if (this.cfg.type === 'phone') {
							phoneLogin?.click();
							await sleep(1000);

							$el('#phone').value = getValue('cx.login.phone');
							$el('#pwd').value = getValue('cx.login.password');

							// 点击登录
							await sleep(1000);
							$el('#loginBtn').click();
						} else {
							idLogin?.click();
							await sleep(1000);
							const search = $el('#inputunitname');
							search.focus();
							search.value = getValue('cx.login.school');
							// @ts-ignore
							unsafeWindow.search(search);

							// 等待搜索
							await sleep(2000);

							$el('#r1b > li').click();
							$el('#uname').value = getValue('cx.login.id');
							$el('#password').value = getValue('cx.login.password');

							$message('info', { content: '请输入验证码后点击登录。' });
						}
					}, 3000);
					const close = el('a', '取消');
					const msg = $message('info', { content: el('span', ['3秒后自动登录。', close]) });
					close.href = '#';
					close.onclick = () => {
						clearTimeout(id);
						msg.remove();
					};
				}
			}
		}),
		new Script({
			name: '使用提示',
			url: [/chaoxing.com/],
			level: 1,
			namespace: 'cx.guide',
			configs: {
				notes: {
					defaultValue: `请手动进入视频、作业、考试页面，脚本会自动运行。`
				}
			}
		})
	]
};
