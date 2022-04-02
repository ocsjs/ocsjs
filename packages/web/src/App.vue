<template>
    <div class="main h-100">
        <Title></Title>
        <Index></Index>
    </div>
</template>

<script setup lang="ts">
import Index from "./pages/index.vue";
import Title from "./components/Title.vue";
import { notify } from "./utils/notify";
import { fetchRemoteNotify } from "./utils";

/** 获取最新远程通知 */
fetchRemoteNotify();

/** 如果正在更新的话，获取更新进度 */
const { ipcRenderer } = require("electron");
ipcRenderer.on("update", (e, tag, rate, totalLength, chunkLength) => {
    notify(
        "OCS更新程序",
        `更新中: ${(chunkLength / 1024 / 1024).toFixed(2)}MB/${(
            totalLength /
            1024 /
            1024
        ).toFixed(2)}MB`,
        "updater",
        { type: "info", duration: 5, close: false }
    );
});
</script>

<style lang="less">
@import "@/assets/css/bootstrap.min.css";
@import "@/assets/css/common.css";

.main {
    display: grid;
    grid-template-rows: 28px auto;
    grid-template-areas:
        "header"
        "main ";
}

.ant-modal-confirm .ant-modal-body {
    padding: 12px !important;
}
</style>
