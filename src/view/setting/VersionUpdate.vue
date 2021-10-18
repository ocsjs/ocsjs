<template>
    <div>
        <Card :bordered="false" color="blue" style="text-align: right" title="更新设置">
            <template #body>
                <a-descriptions
                    :column="1"
                    :labelStyle="{ fontWeight: 'bold', height: '32px' }"
                >
                    <a-descriptions-item label="当前版本">
                        <span class="space-10 flex">
                            <span>{{ Remote.app.call("getVersion") }} </span>
                            <LoadingOutlined v-if="needUpdate === -1" />
                            <div v-else-if="needUpdate === 1">
                                <a-tag color="#f50">需要更新</a-tag>
                            </div>
                            <div v-else>
                                <a-tag color="#87d068">已经是最新版本</a-tag>
                            </div>
                        </span>
                    </a-descriptions-item>
                    <a-descriptions-item label="上次检测时间">
                        {{ new Date(update.lastTime).toLocaleString() }}
                    </a-descriptions-item>
                    <a-descriptions-item label="自动更新">
                        <a-switch v-model:checked="update.autoUpdate" />
                    </a-descriptions-item>
                    <a-descriptions-item label="自动更新间隔">
                        <div class="space-10">
                            <a-input-number
                                size="small"
                                :min="1"
                                :max="24"
                                :default-value="1"
                                v-model:value="update.hour"
                                :disabled="!update.autoUpdate"
                            />
                            <span>小时</span>
                        </div>
                    </a-descriptions-item>
                </a-descriptions>

                <div class="space-10">
                    <a-button type="primary" @click="checkUpdate">更新检测</a-button>
                    <a-button type="primary" @click="onUpdate"> 更新 </a-button>
                </div>
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
import { Remote } from "@/utils/remote";

import { onMounted, ref } from "vue";

import { message } from "ant-design-vue";
import { setting } from "./setting";
import { IPCEventTypes } from "app/types";
const { update } = setting;
const { ipcRenderer } = require("electron");

const needUpdate = ref(-1);

function checkUpdate() {
    needUpdate.value = -1;
    needUpdate.value = ipcRenderer.sendSync(IPCEventTypes.IS_NEED_UPDATE) ? 1 : 0;
    if (needUpdate.value === 1) {
        message.warn("需要更新");
    } else {
        message.success("已经是最新版本");
    }
}

function onUpdate() {
    ipcRenderer.send(IPCEventTypes.APP_UPDATE);
}
onMounted(() => {
    needUpdate.value = ipcRenderer.sendSync(IPCEventTypes.IS_NEED_UPDATE) ? 1 : 0;
});
</script>

<style scope lang="less"></style>
