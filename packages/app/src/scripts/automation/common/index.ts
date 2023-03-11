import { PlaywrightScript } from '../../script';

export const NewPageScript = new PlaywrightScript(
	{
		url: {
			label: '网页链接',
			value: ''
		}
	},
	{
		name: '通用-新建页面',
		async run(page, configs) {
			if (configs.url.startsWith('http')) {
				await page.goto(configs.url);
			} else {
				throw new Error('网页链接格式不正确，请输入 http 开头的链接。');
			}
		}
	}
);
