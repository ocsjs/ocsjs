import { getDefinedProjects } from '.';
import { Project } from '../interfaces/project';
import { Script } from '../interfaces/script';
import { getAllRawConfigs, addConfigChangeListener } from '../utils/common';
import cloneDeep from 'lodash/cloneDeep';

export const CommonProject: Project = {
	name: '通用',
	domains: [],
	scripts: [
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
