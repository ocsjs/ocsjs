import { Project } from '../interfaces/project';
import { Script } from '../interfaces/script';
import { $$el } from '../utils/dom';
import { $model } from './init';

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
