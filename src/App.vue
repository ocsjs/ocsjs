<template>
    <a-layout class="layout" style="height: 100%">
        <a-layout-header id="layout-header">
            <Navigation />
        </a-layout-header>
        <a-layout-content id="layout-content">
            <transition name="fade">
                <router-view v-slot="{ Component }">
                    <keep-alive>
                        <component :is="Component" />
                    </keep-alive>
                </router-view>
            </transition>
        </a-layout-content>
        <a-layout-footer id="layout-footer">
            <Footer></Footer>
        </a-layout-footer>
    </a-layout>
</template>

<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup

import Navigation from "./components/layout/Navigation.vue";

const { ipcRenderer } = require("electron");
import { Button, message, notification } from "ant-design-vue";

import { NotificationArgsProps } from "ant-design-vue/lib/notification";
import { OCSEventTypes, Notify } from "app/types";

import { h, onMounted } from "@vue/runtime-core";
import { NetWorkCheck } from "./utils/request";
import {
    GiteeUpdater,
    LatestInfo,
    LatestTag,
    needUpdate,
    refreshUpdateInfo,
} from "./view/setting/updater";
import { showFormatSize } from "./view/setting/updater/types";
import { checkToken, config, TokenInfo } from "./utils/store";

// 网络检测
onMounted(async () => {
    await NetWorkCheck();
});

/**
 * 注册 remote 消息
 */
ipcRenderer.on(OCSEventTypes.INFO, (e: any, msg: string[]) => {
    message.info(msg);
});
ipcRenderer.on(OCSEventTypes.WARN, (e: any, msg: string[]) => {
    message.warn(msg);
});
ipcRenderer.on(OCSEventTypes.SUCCESS, (e: any, msg: string[]) => {
    message.success(msg);
});
ipcRenderer.on(OCSEventTypes.ERROR, (e: any, msg: string[]) => {
    message.error(msg);
});

// 注册 remote notify 消息
ipcRenderer.on(OCSEventTypes.NOTIFY, (e: any, notify: Notify) => {
    openNotify(notify);
});

onMounted(async () => {
    await refreshUpdateInfo();
    // 更新交互
    if (LatestInfo.value) {
        if (needUpdate.value) {
            await checkUpdate();
        }
    }

    // 检测查题码
    const queryToken = config.setting.script.account.queryToken;
    console.log("queryToken",queryToken);
    
    if(TokenInfo.value.code===0){
        await checkToken(queryToken);
    }
});

 

async function checkUpdate() {
    if (LatestInfo.value) {
        const key = "update-checker";
        notification.info({
            duration: 0,
            placement: "bottomRight",
            key,
            message: "更新检测",
            description: h("div", [
                h("span", "检测到当前有新版本发布"),
                h("ul", { class: "font-v4", style: { paddingInlineStart: "24px" } }, [
                    h("li", `版本 : ${LatestInfo.value.version || "无"}`),
                    h("li", `更新信息 : ${LatestInfo.value.message || "无"}`),
                    h(
                        "li",
                        `大小 : ${
                            LatestInfo.value.size
                                ? showFormatSize(LatestInfo.value.size)
                                : "无"
                        }`
                    ),
                    h(
                        "li",
                        `发布日期 : ${
                            LatestInfo.value.date
                                ? new Date(LatestInfo.value.date).toLocaleString()
                                : "无"
                        }`
                    ),
                ]),
            ]),
            btn: h("span", { class: "space-12" }, [
                h(
                    Button,
                    {
                        type: "primary",
                        size: "small",
                        onClick: () => {
                            notification.close(key);
                            setTimeout(() => {
                                checkUpdate();
                            }, 10 * 60 * 1000);
                        },
                    },
                    "稍后处理"
                ),
                h(
                    Button,
                    {
                        type: "primary",
                        size: "small",
                        onClick: () => {
                            if (LatestTag.value) {
                                notification.close(key);
                                GiteeUpdater.update(LatestTag.value);
                            }
                        },
                    },
                    "更新"
                ),
            ]),
            style: {
                padding: "12px",
            },
            onClose: () => {
                notification.close(key);
                // 稍后处理
                setTimeout(() => {
                    checkUpdate();
                }, 10 * 60 * 1000);
            },
        });
    }
}

function openNotify(notify: Notify) {
    const commonConfig: Omit<NotificationArgsProps, "type"> = {
        duration: notify.type === "error" ? 0 : 5,
        placement: "bottomRight",
        key: notify.name,
        message: notify.title,
        description: notify.message,
        style: {
            padding: "12px",
        },
        onClose: () => {
            notification.close(notify.name);
        },
    };
    // 调用通知
    notification[notify.type](commonConfig);
}
</script>

<style lang="less">
@import "@/assets/css/common.css";

// 隐藏过渡效果
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

// 折叠加隐藏过渡效果
.collapse-enter-active,
.collapse-leave-active {
    transition: all 0.25s ease-in-out;
    overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
    padding: 0px 18px !important;
    height: 0px !important;
    opacity: 0;
}
</style>
