<template>
    <div>
        <card title="系统设置">
            <item label="窗口置顶" font-bold>
                <a-switch
                    v-model:checked="system.win.isAlwaysOnTop"
                    @change="Remote.win.call('setAlwaysOnTop', system.win.isAlwaysOnTop)"
                />
            </item>
            <item label="开机自启" font-bold>
                <a-switch
                    v-model:checked="system.win.autoStart"
                    @change="
                        Remote.app.call('setLoginItemSettings', {
                            openAtLogin: system.win.autoStart,
                        })
                    "
                />
            </item>
        </card>
        <card title="路径设置">
            <item label="软件路径" font-bold>
                <span class="path" @click="shell.openPath(appPath)">
                    {{ appPath }}
                </span>
            </item>
            <item label="可执行文件" font-bold>
                <span class="path" @click="shell.showItemInFolder(exePath)">
                    {{ exePath }}
                </span>
            </item>
            <item label="配置文件" font-bold @click="shell.showItemInFolder(configPath)">
                <span class="path"> {{ configPath }}</span>
            </item>

            <item label="用户数据" font-bold>
                <span class="flex ai-center space-10">
                    <span class="path" @click="shell.openPath(system.path.userData)">
                        {{ system.path.userData }}
                    </span>
                    <FolderTwoTone @click="settingPath('userData')" />
                </span>
            </item>

            <item label="日志存储" font-bold>
                <span class="flex ai-center space-10">
                    <span class="path" @click="shell.openPath(system.path.logs)">
                        {{ system.path.logs }}
                    </span>

                    <FolderTwoTone @click="settingPath('logs')" />
                </span>
            </item>
        </card>
    </div>
</template>

<script setup lang="ts">
import Card from "@/components/common/Card.vue";
import { Remote } from "@/utils/remote";
import { SystemSetting } from "app/types";

import { setting } from "./setting";
import Item from "@/components/common/item.vue";
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
