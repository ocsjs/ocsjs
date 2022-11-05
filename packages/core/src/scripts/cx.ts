import { Script } from '../interfaces/script';

export const CXScript = new Script({
	name: '',
	url: [],
	notes: [],
	configs: {
		test: {
			defaultValue: 1,
			label: '测试'
		},
		test2: {
			label: '测试2',
			defaultValue: 2
		}
	},

	start({ cfg }) {},
	stop() {}
});
