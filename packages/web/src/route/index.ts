import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import { config } from "../config";

/**
 * 根据配置生成路由
 */

export const routes: RouteRecordRaw[] = Reflect.ownKeys(config.routes).map((key) => Reflect.get(config.routes, key));

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

router.beforeEach((to, from) => {
    return true;
});
