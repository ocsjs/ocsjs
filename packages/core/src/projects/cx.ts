import { Project } from '../interfaces/project';
import { Script } from '../interfaces/script';
import { $$el } from '../utils/dom';
import { $model } from './init';

export const CXProject: Project = {
	name: '超星学习通',
	domains: ['chaoxing.com'],
	scripts: [
		new Script({
			name: '章节提示',
			namespace: 'cx.chapter',
			url: [/\/mooc2-ans\/mycourse\/studentcourse/],
			configs: {
				notes: { defaultValue: '' }
			},
			oncomplete() {
				const list = $$el('.catalog_task .catalog_jindu');
				let count = 5;
				this.cfg.notes = `请点击任意一个章节进入课程\n ${count--} 秒后将自动进入。`;
				const id = setInterval(() => {
					if (count <= 0) {
						if (list.length) {
							list[0].click();
						} else {
							this.cfg.notes = '全部任务已完成！';
							$model('prompt', {
								content: '全部任务已完成！',
								onConfirm(val) {
									alert(val);
								}
							});
						}
						clearInterval(id);
					} else {
						this.cfg.notes = `请点击任意一个章节进入课程\n ${count--} 秒后将自动进入。`;
					}
				}, 1000);
			}
		}),
		new Script({
			name: '课程学习',
			namespace: 'cx.study',
			url: [/\/mycourse\/studentstudy/],

			configs: {
				notes: { defaultValue: `测试aaaa` },
				test: {
					defaultValue: 1,
					attrs: { type: 'number', title: '测试选项' },
					label: '测试'
				},
				range: {
					defaultValue: 1,
					attrs: { type: 'range', step: '1', max: '16' },
					label: '测试',
					onload() {
						this.addEventListener('change', () => {
							this.title = this.value + 'x';
						});
						this.title = this.value + 'x';
					}
				},
				test2: {
					label: '测试2',
					tag: 'select',

					defaultValue: 2,
					onload() {
						this.innerHTML = [1, 2, 3]
							.map((i) => `<option ${this.value === i.toString() ? 'selected' : ''} value=${i}>${i}</option>`)
							.join('');
					}
				},
				test3: {
					label: '测试3---输入框',
					attrs: { title: '测试' },
					tag: 'textarea'
				},
				switch: {
					label: '测试4',
					attrs: { type: 'checkbox', className: 'input-switch' }
				},
				radio: {
					label: '测试5',
					attrs: { type: 'radio' }
				}
			}
		})
	]
};
