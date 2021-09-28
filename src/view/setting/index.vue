<template>
    <a-layout class="box-shadow-base" style="padding: 24px 0; background: #fff">
        <a-layout-sider width="200" style="background: #fff">
            <a-menu mode="inline" style="height: 100%">
                <a-menu-item
                    key="1"
                    class="space-12"
                    @click="$router.push('/setting/common')"
                >
                    <AppstoreOutlined /> <span>通用设置</span>
                </a-menu-item>
                <a-menu-item
                    key="2"
                    class="space-12"
                    @click="$router.push('/setting/script')"
                >
                    <BugOutlined /> <span>脚本设置</span>
                </a-menu-item>
                <a-menu-item
                    key="3"
                    class="space-12"
                    @click="$router.push('/setting/system')"
                >
                    <ToolOutlined /> <span>系统设置</span>
                </a-menu-item>
                <a-menu-item
                    key="4"
                    class="space-12"
                    @click="$router.push('/setting/version')"
                >
                    <CloudDownloadOutlined /> <span>版本更新</span>
                </a-menu-item>
            </a-menu>
        </a-layout-sider>
        <a-layout-content>
            <router-view></router-view>
        </a-layout-content>
    </a-layout>
</template>

<script setup lang="ts"></script>

<style scope lang="less"></style>
