<template>
    <h1>task</h1>
    <div>
        <a-button type="primary" @click="start">start</a-button>
    </div>
</template>

<script setup lang="ts">
const { ipcRenderer } = require("electron");

function start() {
    console.log("run-script");
    
    ipcRenderer.send("run-script")
}
</script>

<style scope lang="less"></style>
