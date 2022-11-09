import { Project } from '../interfaces/project';
import { Script } from '../interfaces/script';

export const ZHSProject: Project = {
	name: '知道智慧树',
	level: 99,
	domains: ['zhihuishu.com'],
	scripts: [
		new Script({
			name: '课程学习',
			url: [/.*/],
			level: 99,
			namespace: 'zhs.study',
			configs: {
				notes: {
					defaultValue: `智慧树111`
				}
			}
		})
	]
};
