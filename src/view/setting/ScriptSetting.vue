<template>
    <div>
        <a-layout style="padding: 24px 0; background: #fff">
            <a-layout-sider width="200" style="background: #fff">
                <a-menu
                    mode="inline"
                    v-model:selectedKeys="selectedKeys2"
                    v-model:openKeys="openKeys"
                    style="height: 100%"
                >
                    <a-menu-item
                        key="launch"
                        @click="$router.push('/setting/script/launch')"
                        >启动设置</a-menu-item
                    >
                    <a-menu-item
                        key="token"
                        @click="$router.push('/setting/script/token')"
                        >查题码设置</a-menu-item
                    >
                    <a-menu-item key="ocr" @click="$router.push('/setting/script/ocr')"
                        >OCR设置</a-menu-item
                    >
                    <a-sub-menu key="script" title="脚本设置">
                        <a-menu-item
                            key="cx"
                            @click="$router.push('/setting/script/cx')"
                            >超星设置</a-menu-item
                        >
                        <a-menu-item
                            key="zhs"
                            @click="$router.push('/setting/script/zhs')"
                            >智慧树设置</a-menu-item
                        >
                    </a-sub-menu>
                </a-menu>
            </a-layout-sider>
            <a-layout-content :style="{ padding: '0 24px', minHeight: '340px' }">
                <transition name="fade">
                    <router-view v-slot="{ Component }">
                        <keep-alive>
                            <component :is="Component" />
                        </keep-alive>
                    </router-view>
                </transition>
            </a-layout-content>
        </a-layout>
        <!-- 
 

         -->
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
 
 
const selectedKeys2 = ref<string[]>(["script"]);
const openKeys = ref<string[]>(["script"]);


</script>

<style scope lang="less">
#app .ant-descriptions-row > td {
    padding-bottom: 6px;
}

.ant-switch {
    min-width: 36px;
    height: 18px;
}
.ant-switch::after {
    width: 14px;
    height: 14px;
}
</style>
