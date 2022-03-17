<template>
    <a-menu-item @click="open(url)">{{ title }}</a-menu-item>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs } from "vue";
interface TitleLinkProps {
    url: string;
    title: string;
}
const props = withDefaults(defineProps<TitleLinkProps>(), {});
const {} = toRefs(props);

const { shell } = require("electron");

function open(url: string) {
    shell.openExternal(url);
}
</script>

<style scope lang="less"></style>
