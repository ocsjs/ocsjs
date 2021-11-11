import { createRouter, createWebHashHistory } from "vue-router";
import index from "@/view/index/index.vue";
import task from "@/view/task/index.vue";
import users from "@/view/users/index.vue";

import setting from "@/view/setting/index.vue";
import CommonSetting from "@/view/setting/CommonSetting.vue";
import ScriptSetting from "@/view/setting/ScriptSetting.vue";
import SystemSetting from "@/view/setting/SystemSetting.vue";
import VersionUpdate from "@/view/setting/VersionUpdate.vue";

import Launch from "@/view/setting/script/Launch.vue";
import Token from "@/view/setting/script/Token.vue";
import Ocr from "@/view/setting/script/Ocr.vue";
import CX from "@/view/setting/script/platform/cx.vue";
import ZHS from "@/view/setting/script/platform/zhs.vue";

export const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: "/",
            name: "index",
            component: index,
            meta: {
                desc: "关于",
            },
        },
        {
            path: "/task",
            name: "task",
            component: task,
            meta: {
                desc: "任务列表",
            },
        },
        {
            path: "/setting",
            name: "setting",
            component: setting,
            children: [
                {
                    path: "script",
                    name: "setting-script",
                    component: ScriptSetting,
                    meta: {
                        desc: "脚本设置",
                    },
                    children: [
                        {
                            path: "launch",
                            name: "setting-script-launch",
                            component: Launch,
                            meta: {
                                desc: "启动设置",
                            },
                        },
                        {
                            path: "token",
                            name: "setting-script-token",
                            component: Token,
                            meta: {
                                desc: "查题码设置",
                            },
                        },
                        {
                            path: "ocr",
                            name: "setting-script-ocr",
                            component: Ocr,
                            meta: {
                                desc: "OCR设置",
                            },
                        },
                        {
                            path: "cx",
                            name: "setting-script-cx",
                            component: CX,
                            meta: {
                                desc: "超星设置",
                            },
                        },
                        {
                            path: "zhs",
                            name: "setting-script-zhs",
                            component: ZHS,
                            meta: {
                                desc: "智慧树设置",
                            },
                        },
                    ],
                },
                {
                    path: "common",
                    name: "setting-common",
                    component: CommonSetting,
                    meta: {
                        desc: "通用设置",
                    },
                },

                {
                    path: "system",
                    name: "setting-system",
                    component: SystemSetting,
                    meta: {
                        desc: "系统设置",
                    },
                },
                {
                    path: "version",
                    name: "setting-version-update",
                    component: VersionUpdate,
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
            component: users,
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

router.beforeEach((to, from) => {
    console.log("router",{to, from});
    
    return !!to.name && router.hasRoute(to.name);
});
