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

import { Button, notification } from "ant-design-vue";
 
import { h, onMounted } from "@vue/runtime-core";
import { NetWorkCheck } from "./utils/request";
import { Updater, updateInfos, refreshUpdateInfo } from "./view/setting/updater";
import { showFormatSize } from "./view/setting/updater/types";
import { checkToken, config, TokenInfo } from "./utils/store";

import { RegisterKeys } from "./utils/key.register";

// 网络检测
onMounted(async () => {
    await NetWorkCheck();
});

onMounted(async () => {
    setTimeout(async () => {
        if (updateInfos.autoUpdate) {
            await refreshUpdateInfo();
            // 更新交互
            if (updateInfos.latestInfo) {
                if (updateInfos.needUpdate) {
                    await checkUpdate();
                }
            }
        }

        // 检测查题码
        const queryToken = config.setting.script.account.queryToken;
        console.log("queryToken", queryToken);

        if (TokenInfo.value.code === 0) {
            await checkToken(queryToken);
        }
    }, 2000);
});

async function checkUpdate() {
    if (updateInfos.latestInfo) {
        const key = "update-checker";
        notification.info({
            duration: 0,
            placement: "bottomRight",
            key,
            message: "更新检测",
            description: h("div", [
                h("span", "检测到当前有新版本发布"),
                h("ul", { class: "font-v4", style: { paddingInlineStart: "24px" } }, [
                    h("li", `版本 : ${updateInfos.latestInfo.version || "无"}`),
                    h("li", `更新信息 : ${updateInfos.latestInfo.message || "无"}`),
                    h(
                        "li",
                        `大小 : ${
                            updateInfos.latestInfo.size
                                ? showFormatSize(updateInfos.latestInfo.size)
                                : "无"
                        }`
                    ),
                    h(
                        "li",
                        `发布日期 : ${
                            updateInfos.latestInfo.date
                                ? new Date(updateInfos.latestInfo.date).toLocaleString()
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
                            if (updateInfos.latestTag && updateInfos.latestInfo) {
                                notification.close(key);
                                Updater.update(
                                    updateInfos.latestTag,
                                    updateInfos.latestInfo
                                );
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
 
// 注册按键事件
RegisterKeys(window);
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
