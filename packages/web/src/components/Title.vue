<template>
    <div class="title">
        <img :src="config.icon" width="16" height="16" />
        <span class="ms-2">{{ config.title }}</span>
    </div>
</template>

<script setup lang="ts">
import { config } from "../store";
</script>

<style scope lang="less">
.title {
    padding: 0px 20px;
    height: 32px;
    width: 100%;
    display: inline-flex;
    align-items: center;
    background-color: #f8f8f8;
    -webkit-app-region: drag;
}
</style>
