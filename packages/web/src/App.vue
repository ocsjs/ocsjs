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
import axios from "axios";
import { message, Modal } from "ant-design-vue";
import { store } from "./store";
import { h } from "vue";

/** 获取最新通知 */
axios
    .get("https://enncy.github.io/online-course-script/infos.json?t=" + Date.now())
    .then(({ data }) => {
        const notify = (data.notify as any[]) || [];

        /** 寻找未阅读的通知 */
        const unread = notify.filter(
            (item) =>
                // 寻找未阅读过的
                (store.notify as any[]).findIndex(
                    (localeItem) => item?.id === localeItem?.id
                ) === -1
        );

        console.log("notify", { data, exits: store.notify, unread });
        if (unread.length) {
            Modal.info({
                title: () => "🎉最新公告🎉",
                okText: "朕已阅读",
                cancelText: "下次一定",
                okCancel: true,
                style: { top: "20px" },
                content: () =>
                    h(
                        "div",
                        {
                            style: {
                                maxHeight: "320px",
                                overflow: "auto",
                            },
                        },
                        unread.map((item) =>
                            h("div", [
                                h(
                                    "div",
                                    {
                                        style: {
                                            marginBottom: "6px",
                                            fontWeight: "bold",
                                        },
                                    },
                                    item?.id || "无标题"
                                ),
                                h(
                                    "ul",
                                    item.content.map((text: string) => h("li", text))
                                ),
                            ])
                        )
                    ),
                onOk() {
                    store.notify = [...store.notify].concat(unread);
                },
                onCancel() {},
            });
        }
    })
    .catch((err) => message.error("最新通知获取失败 : " + err));

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
