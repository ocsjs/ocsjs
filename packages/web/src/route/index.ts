import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import { config } from '../config';

/**
 * 根据配置生成路由
 */

export type CustomRouteType = RouteRecordRaw & {
	name: string;
	path: string;
	component: any;
	meta: {
		icon: string;
		filledIcon: string;
		title: string;
		hideInMenu: boolean;
		tutorial: {
			step: number;
			placement: string;
			tooltip: string;
		};
	};
};

export const routes = config.routes as CustomRouteType[];

export const router = createRouter({
	history: createWebHashHistory(),
	routes
});

router.beforeEach(() => {
	return true;
});
