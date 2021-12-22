import { createRouter, createWebHashHistory } from "vue-router";

export const dynamicImportRouter = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: "/",
            name: "index",
            component: () => import("@/view/index/index.vue"),
            meta: {
                desc: "关于",
            },
        },
        {
            path: "/task",
            name: "task",
            component: () => import("@/view/task/index.vue"),
            meta: {
                desc: "任务列表",
            },
        },
        {
            path: "/setting",
            name: "setting",
            component: () => import("@/view/setting/index.vue"),
            children: [
                {
                    path: "script",
                    name: "setting-script",
                    component: () => import("@/view/setting/ScriptSetting.vue"),
                    meta: {
                        desc: "脚本设置",
                    },
                    children: [
                        {
                            path: "launch",
                            name: "setting-script-launch",
                            component: () => import("@/view/setting/script/Launch.vue"),
                            meta: {
                                desc: "启动设置",
                            },
                        },
                        {
                            path: "token",
                            name: "setting-script-token",
                            component: () => import("@/view/setting/script/Token.vue"),
                            meta: {
                                desc: "查题码设置",
                            },
                        },
                        {
                            path: "ocr",
                            name: "setting-script-ocr",
                            component: () => import("@/view/setting/script/Ocr.vue"),
                            meta: {
                                desc: "OCR设置",
                            },
                        },
                        {
                            path: "cx",
                            name: "setting-script-cx",
                            component: () => import("@/view/setting/script/platform/cx.vue"),
                            meta: {
                                desc: "超星设置",
                            },
                        },
                        {
                            path: "zhs",
                            name: "setting-script-zhs",
                            component: () => import("@/view/setting/script/platform/zhs.vue"),
                            meta: {
                                desc: "智慧树设置",
                            },
                        },
                    ],
                },
                {
                    path: "common",
                    name: "setting-common",
                    component: () => import("@/view/setting/CommonSetting.vue"),
                    meta: {
                        desc: "通用设置",
                    },
                },

                {
                    path: "system",
                    name: "setting-system",
                    component: () => import("@/view/setting/SystemSetting.vue"),
                    meta: {
                        desc: "系统设置",
                    },
                },
                {
                    path: "version",
                    name: "setting-version-update",
                    component: () => import("@/view/setting/VersionUpdate.vue"),
                    meta: {
                        desc: "版本更新",
                    },
                },
            ],
            meta: {
                desc: "设置",
            },
        },
        {
            path: "/users",
            name: "users",
            component: () => import("@/view/users/index.vue"),
            meta: {
                desc: "账号管理",
            },
        },

        {
            path: "/:catchAll(.*)",
            name: "404",
            redirect: "/",
        },
    ],
});

dynamicImportRouter.beforeEach((to, from) => {
    console.log("router", { to, from });
    return !!to.name && dynamicImportRouter.hasRoute(to.name);
});
