import { Project } from '../interfaces/project';
import { Script } from '../interfaces/script';
import { $$el } from '../utils/dom';

export const CXProject: Project = {
	name: '超星学习通',
	domains: ['chaoxing.com'],
	scripts: [
		new Script({
			name: '章节提示',
			namespace: 'cx.chapter',
			url: [/\/mycourse\/stu\?.*&pageHeader=1/],
			notes: ['请点击任意一个章节进入课程，5秒后自动进入。'],
			oncomplete() {
				const list = $$el('.catalog_task .catalog_jindu');
				if (list.length) {
					list[0].click();
				} else {
					//
				}
			}
		}),
		new Script({
			name: '课程学习',
			namespace: 'cx.study',
			url: [/\/mycourse\/studentstudy/],
			notes: ['测试', '111'],
			configs: {
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
				}
			}
		})
	]
};
