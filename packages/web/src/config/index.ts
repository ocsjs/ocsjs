import { reactive, shallowRef } from 'vue';
import { RouteRecordRaw } from 'vue-router';

import page from '@/pages/index.vue';
import bookmarks from '@/pages/bookmarks.vue';
import setting from '@/pages/setting/index.vue';
import browsers from '@/pages/browsers/index.vue';
import dashboard from '@/pages/dashboard/index.vue';
import userScripts from '@/pages/user-scripts/index.vue';
import resources from '@/pages/resources/index.vue';
import { GreasyForkUserScript, ScriptCatUserScript, CommonUserScript } from '../types/user.script';
import { remote } from '../utils/remote';
import { ScriptSearchEngine } from '../types/search';

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
			name: 'index',
			path: '/',
			redirect: '/browsers',
			component: shallowRef(page),
			children: [
				{
					name: 'browsers',
					path: 'browsers',
					component: shallowRef(browsers),
					meta: {
						icon: 'view_list',
						filledIcon: 'view_list',
						title: '浏览器列表'
					}
				},
				{
					name: 'dashboard',
					path: 'dashboard',
					component: shallowRef(dashboard),
					meta: {
						icon: 'image',
						filledIcon: 'image',
						title: '监控台'
					}
				},
				{
					name: 'user-scripts',
					path: 'user-scripts',
					component: shallowRef(userScripts),
					meta: {
						icon: 'code',
						filledIcon: 'code',
						title: '用户脚本'
					}
				},
				{
					name: 'resources',
					path: 'resources',
					component: shallowRef(resources),
					meta: {
						icon: 'widgets',
						filledIcon: 'widgets',
						title: '应用中心'
					}
				},
				{
					name: 'setting',
					path: 'setting',
					component: shallowRef(setting),
					meta: {
						icon: 'settings',
						filledIcon: 'settings',
						title: '设置'
					}
				}
			]
		},
		{
			name: 'bookmarks',
			path: '/bookmarks',
			component: shallowRef(bookmarks),
			meta: {
				icon: 'view_list',
				filledIcon: 'view_list',
				title: '书签列表',
				/** 隐藏在左侧菜单栏 */
				hideInMenu: true
			}
		}
	] as RouteRecordRaw[],
	/** 主题预设 */
	themes: {
		dark: false
	},

	/** 用户脚本搜索引擎 */
	scriptSearchEngines: [
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
		},
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
		}
	] as ScriptSearchEngine[]
});
