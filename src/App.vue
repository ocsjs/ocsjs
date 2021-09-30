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
 
import Navigation from "./components/Navigation.vue";

const { shell, ipcRenderer } = require("electron");
import { message } from "ant-design-vue";

ipcRenderer.on("info", (e: any,  msg: string[]) => {
    message.info(msg);
});
ipcRenderer.on("warn", (e: any,  msg: string[]) => {
    message.warn(msg);
});
ipcRenderer.on("success", (e: any,  msg: string[]) => {
    message.success(msg);
});
ipcRenderer.on("error", (e: any,  msg: string[]) => {
    message.error(msg);
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
