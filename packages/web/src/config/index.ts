import { reactive, shallowRef } from 'vue';
import { RouteRecordRaw } from 'vue-router';
import setting from '@/pages/setting/index.vue';
import files from '@/pages/files/index.vue';
import dashboard from '@/pages/dashboard/index.vue';
import userScripts from '@/pages/user-scripts/index.vue';
import extensions from '@/pages/extensions/index.vue';
import { LaunchScriptsOptions } from '@ocsjs/scripts';
import { store } from '../store';
import { GreasyForkUserScript, ScriptCatUserScript, CommonUserScript } from '../types/user.script';
import { remote } from '../utils/remote';
import { ExtensionSearchEngine, ScriptSearchEngine } from '../types/search';
import { getRemoteInfos } from '../utils';
import { NodeJS } from '../utils/export';

const { randomUUID } = require('crypto') as typeof import('crypto');

export const config = reactive({
	/**
	 * 路由设置
	 *
	 * why use shallowRef:
	 *
	 * Vue received a Component which was made a reactive object. This can lead to unnecessary performance overhead,
	 * and should be avoided by marking the component with `markRaw` or using `shallowRef` instead of `ref`.
	 */
	routes: [
		{
			name: 'files',
			path: '/',
			component: shallowRef(files),
			meta: {
				icon: 'icon-file-text',
				filledIcon: 'icon-file-text-fill',
				title: '文件',

				tutorial: {
					step: 0,
					placement: 'rightTop',
					tooltip:
						'1. 文件页可以对文件进行创建,管理,运行,关闭等操作, 其中一个文件代表一个独立的浏览器，每个文件之间互不影响，可以用鼠标右键创建文件，左键拖拽文件。'
				}
			}
		},
		{
			name: 'dashboard',
			path: '/dashboard',
			component: shallowRef(dashboard),
			meta: {
				icon: 'icon-dashboard',
				filledIcon: 'icon-dashboard-fill',
				title: '仪表盘',
				tutorial: {
					step: 1,
					placement: 'rightTop',
					tooltip: '2. 仪表盘是进行数据分析以及文件运行时监控图像的页面'
				}
			}
		},
		{
			name: 'user-scripts',
			path: '/user-scripts',
			component: shallowRef(userScripts),
			meta: {
				icon: 'icon-bug',
				filledIcon: 'icon-bug-fill',
				title: '用户脚本',
				tutorial: {
					step: 2,
					placement: 'rightTop',
					tooltip: '3. 用户脚本可以搜索，添加网络脚本到本地，在浏览器运行后，会加载本地的用户脚本，配合浏览器拓展使用。'
				}
			}
		},
		{
			name: 'extensions',
			path: '/extensions',
			component: shallowRef(extensions),
			meta: {
				icon: 'icon-chrome',
				filledIcon: 'icon-chrome-fill',
				title: '浏览器拓展',
				tutorial: {
					step: 3,
					placement: 'rightTop',
					tooltip: '4. 浏览器拓展会对用户脚本进行管理以及解析和运行。'
				}
			}
		},
		{
			name: 'setting',
			path: '/setting',
			component: shallowRef(setting),
			meta: {
				icon: 'icon-setting',
				filledIcon: 'icon-setting-fill',
				title: '设置',
				tutorial: {
					step: 4,
					placement: 'rightTop',
					tooltip:
						'5. 必须设置浏览器路径，不然就无法启动浏览器。（如果你的电脑上已经安装支持的浏览器，那么程序会自动选择）'
				}
			}
		}
	] as RouteRecordRaw[],
	/** 主题预设 */
	themes: [
		{
			key: 'theme-light',
			name: '白昼'
		},
		{
			key: 'theme-night',
			name: '黑夜'
		}
	],

	/**
	 * 初始文件模板
	 */
	ocsFileTemplate: (uid?: string) => {
		uid = uid || randomUUID().replace(/-/g, '');

		return JSON.stringify(
			{
				uid,
				launchOptions: {
					headless: false,
					executablePath: 'default'
				},

				scripts: [
					{
						name: 'cx-login-phone',
						options: {} as any
					}
				],
				userDataDir: NodeJS.path.join(store['user-data-path'], 'scriptUserData', uid),
				init: true,
				localStorage: 'default',
				userScripts: []
			} as LaunchScriptsOptions,
			null,
			4
		);
	},
	/** 浏览器拓展搜索引擎 */
	extensionSearchEngines: [
		{
			name: 'OCS官方拓展',
			homepage: 'https://cdn.ocsjs.com',
			async search() {
				const data = await getRemoteInfos();
				return data.extensions;
			}
		}
	] as ExtensionSearchEngine[],
	/** 用户脚本搜索引擎 */
	scriptSearchEngines: [
		{
			name: 'GreasyFork',
			homepage: 'https://greasyfork.org',
			search: async (keyword: string, page: number, size: number) => {
				const data = await remote.methods.call(
					'get',
					'https://greasyfork.org/zh-CN/scripts.json?' +
						new URLSearchParams({
							q: keyword,
							page: page <= 0 ? '1' : page.toString()
						})
				);

				let list = data as GreasyForkUserScript[];

				list = list.sort((a, b) => {
					return b.daily_installs - a.daily_installs;
				});

				return list.map((item) => {
					const ratings = (item.good_ratings / (item.good_ratings + item.bad_ratings)) * 10;

					return {
						url: item.url,
						name: item.name,
						description: item.description,
						homepage: item.url,
						id: item.id,
						createTime: new Date(item.created_at).getTime(),
						updateTime: new Date(item.code_updated_at).getTime(),
						daily_installs: item.daily_installs,
						total_installs: item.total_installs,
						authors: item.users,
						ratings: ratings ? parseFloat(ratings.toFixed(1)) : 0,
						code_url: item.code_url,
						license: item.license,
						version: item.version
					} as CommonUserScript;
				});
			}
		},
		{
			name: 'ScriptCat - 脚本猫',
			homepage: 'https://scriptcat.org',
			search: async (keyword: string, page: number, size: number) => {
				const data = await remote.methods.call(
					'get',
					'https://scriptcat.org/api/v1/scripts?' +
						new URLSearchParams({
							count: size.toString(),
							page: page <= 0 ? '1' : page.toString(),
							keyword
						})
				);

				let list = data.list as ScriptCatUserScript[];

				list = list.sort((a, b) => {
					return b.today_install - a.today_install;
				});

				return list.map((item) => {
					return {
						id: item.script.script_id,
						version: item.script.version,
						authors: [
							{
								url: `https://scriptcat.org/users/${item.user_id}`,
								name: item.username,
								avatar: item.avatar ? `https://scriptcat.org${item.avatar}` : undefined
							}
						],
						name: item.name,
						description: item.description,
						url: `https://scriptcat.org/script-show-page/${item.script.script_id}`,
						code_url: `https://scriptcat.org/scripts/code/${item.script.script_id}/${item.name}.user.js`,
						ratings: item.score ? (item.score * 2) / 10 : 0,
						createTime: item.createtime * 1000,
						updateTime: item.updatetime * 1000,
						daily_installs: item.today_install,
						total_installs: item.total_install
					} as CommonUserScript;
				});
			}
		}
	] as ScriptSearchEngine[]
});
