<template>
    <div>
        <Card :bordered="false" color="blue" style="text-align: right;">
            <template #title>系统设置</template>
            <template #body>
                <a-descriptions :column="1" :labelStyle="{ fontWeight: 'bold' }">
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
                </a-descriptions>

                <a-button type="primary" @click="checkUpdate">更新检测</a-button>
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
import { Remote } from "@/utils/remote";
 
 
import { onMounted, ref } from "vue";
import { IPCEventTypes } from "app/types";
 
const { ipcRenderer } = require("electron");

const needUpdate = ref(-1);
function checkUpdate() {
    console.log("checkUpdate");
    
    needUpdate.value = -1;
    needUpdate.value = ipcRenderer.sendSync(IPCEventTypes.IS_NEED_UPDATE) ? 1 : 0;
    console.log(needUpdate.value);
    
}
onMounted(() => {
    checkUpdate()
});
</script>

<style scope lang="less"></style>
