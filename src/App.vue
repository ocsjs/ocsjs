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

import { nextTick, onMounted } from "@vue/runtime-core";
import { Status } from "../app/puppeteer/common/status.types";
import Navigation from "./components/Navigation.vue";

const { shell, ipcRenderer } = require("electron");
import { message } from "ant-design-vue";

ipcRenderer.on("info", (e: any, status: Status, msg: string) => {
    message.info(Status[status] + msg ? " : " + msg : "");
});
ipcRenderer.on("warn", (e: any, status: Status, msg: string) => {
    message.warn(Status[status] + msg ? " : " + msg : "");
});
ipcRenderer.on("success", (e: any, status: Status, msg: string) => {
    message.success(Status[status] + msg ? " : " + msg : "");
});
ipcRenderer.on("error", (e: any, status: Status, msg: string) => {
    message.error(Status[status] + msg ? " : " + msg : "");
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
