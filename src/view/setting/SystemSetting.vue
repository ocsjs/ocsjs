<template>
    <div>
        <Card :bordered="false" color="blue" title="系统设置">
            <template #body>
                <a-descriptions :column="1" :labelStyle="{ fontWeight: 'bold' }">
                    <a-descriptions-item label="窗口置顶">
                        <a-switch
                            v-model:checked="system.win.isAlwaysOnTop"
                            @change="
                                Remote.win.call(
                                    'setAlwaysOnTop',
                                    system.win.isAlwaysOnTop
                                )
                            "
                        />
                    </a-descriptions-item>
                </a-descriptions>
            </template>
        </Card>

        <Card :bordered="false" color="blue" title="路径设置">
            <template #body>
                <a-descriptions :column="1" :labelStyle="{ fontWeight: 'bold' }">
                    <a-descriptions-item label="软件路径">
                        <span class="path" @click="shell.openPath(appPath)">
                            {{ appPath }}
                        </span>
                    </a-descriptions-item>

                    <a-descriptions-item label="可执行文件">
                        <span class="path" @click="shell.showItemInFolder(exePath)">
                            {{ exePath }}
                        </span>
                    </a-descriptions-item>
                    <a-descriptions-item
                        label="配置文件"
                        @click="shell.showItemInFolder(configPath)"
                    >
                        <span class="path"> {{ configPath }}</span>
                    </a-descriptions-item>

                    <a-descriptions-item label="用户数据">
                        <div class="space-10 flex ai-center">
                            <span
                                class="path"
                                @click="shell.openPath(system.path.userData)"
                            >
                                {{ system.path.userData }}
                            </span>
                            <FolderTwoTone @click="settingPath('userData')" />
                        </div>
                    </a-descriptions-item>

                    <a-descriptions-item label="日志存储">
                        <div class="space-10 flex ai-center">
                            <span class="path" @click="shell.openPath(system.path.logs)">
                                {{ system.path.logs }}
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
import Card from "@/components/common/Card.vue";
import { Remote } from "@/utils/remote";
import { SystemSetting } from "app/types";

import { setting } from "./setting";
const path = require("path");
const system = setting.system;
const { shell } = require("electron");

const appPath = Remote.app.call("getAppPath");

const exePath = Remote.app.call("getPath", "exe");

const configPath = path.resolve(path.join(system.path.userData, "./config.json"));

function settingPath(name: keyof SystemSetting["path"]) {
    setting.system.path[name] = Remote.dialog
        .call("showOpenDialogSync", {
            properties: ["openDirectory"],
            multiSelections: false,
            defaultPath: setting.system.path[name],
        })
        .pop();
}
</script>

<style scope lang="less">
.path {
    cursor: pointer;
}
</style>
