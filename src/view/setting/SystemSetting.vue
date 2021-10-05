<template>
    <div >
        <Card :bordered="false" color="blue">
            <template #title>系统设置</template>
            <template #body>
                <a-descriptions :column="1" :labelStyle="{ fontWeight: 'bold' }">
                    <a-descriptions-item label="窗口置顶">
                        <a-switch
                            v-model:checked="systemSetting.win.isAlwaysOnTop"
                            @change="
                                Remote.win.call(
                                    'setAlwaysOnTop',
                                    systemSetting.win.isAlwaysOnTop
                                )
                            "
                        />
                    </a-descriptions-item>
                </a-descriptions>
            </template>
        </Card>
 

        <Card :bordered="false" color="blue">
            <template #title>路径设置</template>
            <template #body>
                <a-descriptions :column="1" :labelStyle="{ fontWeight: 'bold' }">
                    <a-descriptions-item label="软件路径">
                        {{ Remote.app.call("getAppPath") }}
                    </a-descriptions-item>

                    <a-descriptions-item label="可执行文件">
                        {{ Remote.app.call("getPath", "exe") }}
                    </a-descriptions-item>

                    <a-descriptions-item label="用户数据">
                        <div class="space-10 flex ai-center">
                            <span
                                class="path"
                                @click="shell.openPath(systemSetting.path.userData)"
                                >{{ systemSetting.path.userData }}
                            </span>
                            <FolderTwoTone @click="settingPath('userData')" />
                        </div>
                    </a-descriptions-item>
                    <a-descriptions-item label="日志存储">
                        <div class="space-10 flex ai-center">
                            <span
                                class="path"
                                @click="shell.openPath(systemSetting.path.logs)"
                            >
                                {{ systemSetting.path.logs }}
                            </span>
             
                            <FolderTwoTone @click="settingPath('logs')" />
                        </div>
                    </a-descriptions-item>
                </a-descriptions>
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
import Card from "@/components/Card.vue";
import { Remote } from "@/utils/remote";
import { PathSetting } from "app/types";
import { systemSetting } from "./setting";
 
 
const { shell } = require("electron");

function settingPath(name: keyof PathSetting) {
    systemSetting.value.path[name] = Remote.dialog
        .call("showOpenDialogSync", {
            properties: ["openDirectory"],
            multiSelections: false,
            defaultPath: systemSetting.value.path[name],
        })
        .pop();
}
</script>

<style scope lang="less">
.path {
    cursor: pointer;
}
</style>
