<template>
    <div>
        <item
            font-bold
            label="浏览器路径"
            description="软件会`自动检测`您的谷歌`浏览器路径`<br>指定的浏览器有：`谷歌` `火狐` `Microsoft Edge`<br>当路径未设置，或者你需要设置`其他浏览器`进行脚本操作，你可以点击`左侧图标`进行浏览器的路径设置"
            md
        >
            <span
                class="path"
                @click="launch.binaryPath && shell.openPath(launch.binaryPath)"
                >{{ launch.binaryPath || "未设置" }}
            </span>
            <template #after><FolderTwoTone @click="setBinaryPath()" /></template>
        </item>
    </div>
</template>

<script setup lang="ts">
import { setBinaryPath } from "@/utils/store";
import { config } from "@/utils/store";

const launch = config.setting.script.launch;
const { shell } = require("electron");
</script>

<style scope lang="less"></style>
