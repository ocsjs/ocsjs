import { createRouter, createWebHashHistory } from "vue-router";
import index from "@/view/index/index.vue";
import task from "@/view/task/index.vue";
import setting from "@/view/setting/index.vue";
import users from "@/view/users/index.vue";
import webview from '@/view/webview/index.vue';
import CommonSetting from "@/view/setting/CommonSetting.vue";
import ScriptSetting from "@/view/setting/ScriptSetting.vue";
import SystemSetting from "@/view/setting/SystemSetting.vue";
import VersionUpdate from "@/view/setting/VersionUpdate.vue";
export const router = createRouter({
    history: createWebHashHistory(),
    routes: [
      
        {
            path: "/",
            name: "index",
            component:index,
            meta: {
                desc: "关于",
            },
        },
        {
            path: "/task",
            name: "task",
            component:task,
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
                    path: "common",
                    name: "setting-common",
                    component:CommonSetting,
                    meta: {
                        desc: "通用设置",
                    },
                },
                {
                    path: "script",
                    name: "setting-script",
                    component:ScriptSetting,
                    meta: {
                        desc: "脚本设置",
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
                    component:VersionUpdate ,
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
    return !!to.name && router.hasRoute(to.name);
});
