<template>
    <a-row>
        <a-col :span="20" class="font-v3">
            <a-menu theme="light" mode="horizontal">
                <a-menu-item key="1" @click="$router.push('/task')">
                    <UnorderedListOutlined class="icon" /> 任务列表
                </a-menu-item>
                <a-menu-item key="2" @click="$router.push('/users')">
                    <UsergroupAddOutlined class="icon" /> 账号管理
                </a-menu-item>
                <a-menu-item key="3" @click="$router.push('/setting')">
                    <SettingOutlined class="icon" /> 设置
                </a-menu-item>
            </a-menu>
        </a-col>
        <a-col :span="4">
            <a-menu
                theme="light"
                mode="horizontal"
                id="operations"
                class="flex jc-flex-end"
                :selectable="false"
            >
                <a-menu-item @click="Remote.call('minimize')">
                    <MinusOutlined />
                </a-menu-item>
                <!-- <a-menu-item @click="Remote.call(max ? 'unmaximize' : 'maximize')">
                    <BorderOutlined v-if="!max" />
                    <MinusSquareOutlined v-else />
                </a-menu-item> -->

                <a-menu-item @click="Remote.call('close')">
                    <CloseOutlined />
                </a-menu-item>
            </a-menu>
        </a-col>
    </a-row>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Remote } from "../utils/remote";
console.log("Remote", Remote);
</script>

<style scope lang="less">
.icon {
    margin-right: 8px;
}

#operations {
    min-width: 125px;
    li {
        padding: 0 10px;
    }
}
</style>
