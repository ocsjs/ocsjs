<template>
    <transition name="fade">
        <router-view v-slot="{ Component }">
            <keep-alive>
                <component class="overflow-auto h-100" :is="Component" />
            </keep-alive>
        </router-view>
    </transition>
</template>

<script setup lang="ts"></script>

<style scope lang="less">
.home {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
}

.content {
    padding: 32px 0;
}

// 隐藏过渡效果
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.125s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
// 折叠加隐藏过渡效果
.collapse-enter-active,
.collapse-leave-active {
    transition: all 0.125s ease-in-out;
    overflow: hidden;
}
.collapse-enter-from,
.collapse-leave-to {
    padding: 0px 18px !important;
    height: 0px !important;
    opacity: 0;
}
</style>
