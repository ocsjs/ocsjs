import { createNote } from '../../components';
import { defineScript } from '../../core/define.script';

export const OUCHNScript = defineScript({
	name: '国家开放大学',
	domain: 'ouchn.cn',
	hide: true,
	routes: [],
	panels: [
		{
			name: '国开小助手',
			url: '**ouchn.cn/**Login**',
			el: () => createNote('提示您:', '登录后才能使用脚本功能哦')
		},
		{
			name: '国开小助手',
			url: '**ouchn.cn/site/ouchnPc/index**',
			el: () => createNote('提示您:', '请点击任意的课程进入。')
		}
	]
});
