<template>
    <div>
        <h1>task</h1>
        <a-button type="primary" @click="start">start</a-button>
        <a-button type="primary" @click="update">update</a-button>
    </div>
</template>

<script setup lang="ts">
import { ScriptLoginOptions, LoginType, IPCEventTypes } from "app/types";

const { ipcRenderer } = require("electron");

function start() {
    const options: ScriptLoginOptions = {
        script: "cx",
        type: LoginType["用户登录"],
        loginConfig: {
            type: LoginType["用户登录"],
            phone: "18275719980",
            password: "skeleton132525",
        },
        ocrOptions: {
            username: "enncy",
            password: "132525",
        },
    };
    ipcRenderer.send(IPCEventTypes.SCRIPT_LOGIN, options);
}

function update() {
    ipcRenderer.send(IPCEventTypes.APP_UPDATE);
}
</script>

<style scope lang="less"></style>
