<template>
    <a-layout style="background: #fff; height: 100%">
        <a-layout-sider style="background: #fff" :collapsed="true">
            <a-menu mode="inline" style="height: 100%" v-model:selectedKeys="current">
                <a-menu-item
                    key="script"
                    class="space-12"
                    @click="$router.push('/setting/script')"
                >
                    <BugOutlined /> <span> 脚本设置</span>
                </a-menu-item>
                <a-menu-item
                    key="common"
                    class="space-12"
                    @click="$router.push('/setting/common')"
                >
                    <AppstoreOutlined /> <span> 通用设置</span>
                </a-menu-item>

                <a-menu-item
                    key="system"
                    class="space-12"
                    @click="$router.push('/setting/system')"
                >
                    <ToolOutlined /> <span> 系统设置</span>
                </a-menu-item>
                <a-menu-item
                    key="version"
                    class="space-12"
                    @click="$router.push('/setting/version')"
                >
                    <CloudDownloadOutlined /> <span> 版本更新</span>
                </a-menu-item>
            </a-menu>
        </a-layout-sider>
        <a-layout-content id="setting-content">
            <transition name="fade">
                <router-view v-slot="{ Component }">
                    <keep-alive>
                        <component :is="Component" />
                    </keep-alive>
                </router-view>
            </transition>
        </a-layout-content>
    </a-layout>
</template>

<script setup lang="ts">
import { ref } from "@vue/reactivity";

const current = ref(["script"]);
</script>

<style scope lang="less">
#setting-content {
    overflow: auto;
    padding: 20px;
    background-color: #f8f8f8;
}
</style>
