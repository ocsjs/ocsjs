import { Project } from '../interfaces/project';
import { Script } from '../interfaces/script';

export const CXScript = new Script({
	name: '超星学习通',
	namespace: 'cx',
	url: [/chaoxing.com/],
	notes: [],
	configs: {
		test: {
			defaultValue: 1,
			label: '测试'
		},
		test2: {
			label: '测试2',
			tag: 'select',
			attrs: { innerHTML: [1, 2, 3].map((i) => `<option value=${i}>${i}</option>`).join('') },
			defaultValue: 2
		}
	},

	start({ cfg }) {
		// setInterval(() => {
		// 	console.log(cfg);
		// }, 1000);
	},
	stop() {}
});

export const CXProject: Project = {
	name: '超星学习通',
	domains: ['chaoxing.com'],
	scripts: [CXScript]
};
