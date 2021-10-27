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
import { message, Modal, notification } from "ant-design-vue";

import { NotificationArgsProps } from "ant-design-vue/lib/notification";
import { OCSEventTypes, Notify, IPCEventTypes } from "app/types";

import { onMounted } from "@vue/runtime-core";
import { NetWorkCheck, request } from "./utils/request";

// 网络检测
onMounted(async() => {
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
    // 是否为更新消息
    const isUpdate = notify.name === IPCEventTypes.APP_UPDATE;
    const commonConfig: Omit<NotificationArgsProps, "type"> = {
        // 如果是更新消息，则不消失，duration 为0，等待更新完成后手动关闭
        duration: isUpdate && notify.type === "info" ? 0 : 5,
        placement: "bottomRight",
        key: notify.name,
        message: notify.title,
        description: notify.message,
        style: {
            padding: "12px",
        },
        class: "notification-message",
        onClose: () => {
            // 如果是更新状态，则通知 electron 关闭更新程序
            if (isUpdate) {
                ipcRenderer.send(IPCEventTypes.CANCEL_APP_UPDATE);
            }
            notification.close(notify.name);
        },
    };
    // 如果是更新通知
    if (isUpdate && notify.type === "success") {
        notification[notify.type](commonConfig);
        setTimeout(() => {
            notification.close(notify.name);
        }, 5000);
    } else {
        // 其他通知
        notification[notify.type](commonConfig);
    }
});
</script>

<style lang="less">
@import "@/assets/css/common.css";

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
