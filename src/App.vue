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
import { message, notification } from "ant-design-vue";

import { NotificationArgsProps } from "ant-design-vue/lib/notification";
import { OCSEventTypes, Notify } from "app/types";

import { onMounted } from "@vue/runtime-core";
import { NetWorkCheck } from "./utils/request";

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
    console.log(notify);
    const commonConfig: Omit<NotificationArgsProps, "type"> = {
        duration: 5,
        placement: "bottomRight",
        key: notify.name,
        message: notify.title,
        description: notify.message,
        style: {
            padding: "12px",
        },
        class: "notification-message",
        onClose: () => {
            notification.close(notify.name);
        },
    };
    // 调用通知
    notification[notify.type](commonConfig);
});
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
