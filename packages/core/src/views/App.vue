<template>
    <div>
        <!-- 标题栏 -->
        <div class="ocs-panel-header draggable">
            <template v-for="(panel, index) in currentPanels" :key="index">
                <div
                    :panel-title="panel.name"
                    class="title"
                    :class="panel.name === activeKey ? 'active' : ''"
                    @click="activeKey = panel.name"
                >
                    {{ panel.name }}
                </div>
            </template>
        </div>

        <!-- 内容栏 -->
        <div class="ocs-panel-container">
            <template v-for="(panel, index) in currentPanels" :key="index">
                <component
                    :panel="panel.name"
                    v-if="panel.name === activeKey"
                    :is="panel.el"
                ></component>
            </template>
        </div>

        <!-- 底部栏 -->
        <div class="ocs-panel-footer draggable">
            <span class="hide-btn" @click="togglePanel"> 点击隐藏 </span>
            <span class="ocs-tip"> OCS 网课助手 {{ OCS.VERSION }} </span>
            <img
                class="ocs-icon"
                src="https://cdn.ocs.enncy.cn/logo.png"
                title="双击展开"
                @dblclick="togglePanel"
                @click="(e) => e.stopPropagation()"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "@vue/reactivity";
import { ref, watch } from "vue";
import { addFunctionEventListener, getCurrentPanels, togglePanel } from "../core/utils";
import { store } from "./store/index";

const scripts = store.scripts;

const panels = ref(getCurrentPanels(scripts));

/**
 * 对面板进行处理
 *
 * 当所有面板都为 default 状态的时候，才显示 default 面板
 *
 * 否则显示其他面板
 */
const currentPanels = computed(() => {
    return (panels.value.every((panel) => panel.default === true)
        ? panels.value
        : panels.value.filter((panel) => !panel.default)
    ).sort((a, b) => (b.priority || 0) - (a.priority || 0));
});

/**
 * 当前面板的 key
 */
const activeKey = ref(currentPanels.value[0]?.name);

history.pushState = addFunctionEventListener(history, "pushState");
history.replaceState = addFunctionEventListener(history, "replaceState");

window.addEventListener("pushState", () => (panels.value = getCurrentPanels(scripts)));
window.addEventListener("replaceState", () => (panels.value = getCurrentPanels(scripts)));

/** 当面板发生改变时重绘 */
watch(currentPanels, () => {
    const key = currentPanels.value.find((p) => p.name === activeKey.value);

    /** 缓存页面，  如果存在相同的面板，则不切换，否则切换回到第一个页面 */
    if (!key) {
        activeKey.value = currentPanels.value[0].name;
    }
});
</script>

<style scope lang="less">
@import "../assets/less/common.less";
@import "../assets/less/cx.less";

.hide-btn {
    float: "left";
    cursor: "pointer";
}
</style>
