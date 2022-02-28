import { reactive, shallowRef } from "vue";
import { RouteRecordRaw } from "vue-router";
import about from "@/pages/about/index.vue";
import setting from "@/pages/setting/index.vue";
import workspace from "@/pages/workspace/index.vue";

export const config = reactive({
    /** 标题设置 */
    title: {
        style: {
            backgroundColor: "#fff",
        } 
    },
    /**
     * 状态存储
     */
    status: {},
    /**
     * 路由设置
     *
     * why use shallowRef:
     *
     * Vue received a Component which was made a reactive object. This can lead to unnecessary performance overhead,
     * and should be avoided by marking the component with `markRaw` or using `shallowRef` instead of `ref`.
     */
    routes: {
        workspace: {
            name: "workspace",
            path: "/",
            component: shallowRef(workspace),
            meta: {
                title: "工作区",
            },
        },
        setting: {
            name: "setting",
            path: "/setting",
            component: shallowRef(setting),
            meta: {
                title: "设置",
            },
        },
        about: {
            name: "about",
            path: "/about",
            component: shallowRef(about),
            meta: {
                title: "关于",
            },
        },
    } as Record<any, RouteRecordRaw>,
});
