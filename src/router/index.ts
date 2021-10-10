import { createRouter, createWebHashHistory } from 'vue-router'
 
export const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            name: 'index',
            component: () => import('@/view/index/index.vue'),
            meta: {
                desc: "关于"
            }

        },
        {
            path: '/task',
            name: 'task',
            component: () => import('@/view/task/index.vue'),
            meta: {
                desc: "任务列表"
            }

        },
        {
            path: '/setting',
            name: 'setting',
            component: () => import('@/view/setting/index.vue'),
            children: [
                {
                    path: 'common',
                    name: 'setting-common',
                    component: () => import('@/view/setting/CommonSetting.vue'),
                    meta: {
                        desc: "通用设置"
                    }
                },
                {
                    path: 'script',
                    name: 'setting-script',
                    component: () => import('@/view/setting/ScriptSetting.vue'),
                    meta: {
                        desc: "脚本设置"
                    }
                },
                {
                    path: 'system',
                    name: 'setting-system',
                    component: () => import('@/view/setting/SystemSetting.vue'),
                    meta: {
                        desc: "系统设置"
                    }
                },
                {
                    path: 'version',
                    name: 'setting-version-update',
                    component: () => import('@/view/setting/VersionUpdate.vue'),
                    meta: {
                        desc: "版本更新"
                    }
                }
            ],
            meta: {
                desc: "设置"
            }


        },
        {
            path: '/users',
            name: 'users',
            component: () => import('@/view/users/index.vue'),
            meta: {
                desc: "账号管理"
            }

        },
        {
            path: '/:catchAll(.*)',
            name: '404',
            redirect: '/'
        }

    ],
})



router.beforeEach((to, from) => {
    return (!!to.name && router.hasRoute(to.name))
})