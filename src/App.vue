<template>
    <a-layout class="layout" style="height: 100%">
        <a-layout-header id="layout-header">
            <Navigation />
        </a-layout-header>
        <a-layout-content id="layout-content">
            <transition name="fade">
                <keep-alive>
                    <router-view></router-view>
                </keep-alive>
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

import Navigation from "./components/Navigation.vue";

const { ipcRenderer } = require("electron");
import { message, notification } from "ant-design-vue";

import { OCSEventTypes, IPCEventTypes, Notify } from "app/electron/events/index";
import { NotificationArgsProps } from "ant-design-vue/lib/notification";

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

ipcRenderer.on(OCSEventTypes.NOTIFY, (e: any, notify: Notify) => {
    const commonConfig: Omit<NotificationArgsProps, "type"> = {
        duration: notify.name === IPCEventTypes.APP_UPDATE ? 0 : 5,
        placement: "bottomRight",
        key: notify.name,
        message: notify.title,
        description: notify.message,
    };
    // 如果是更新通知
    if (notify.name === IPCEventTypes.APP_UPDATE) {
        notification[notify.type](
            Object.assign(commonConfig, {
                onClose: () => {
                    notification.close(notify.name);
                    ipcRenderer.send(IPCEventTypes.CANCEL_APP_UPDATE);
                },
            })
        );
        if (notify.type === "success") {
            setTimeout(() => {
                notification.close(notify.name);
            }, 5000);
        }
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
