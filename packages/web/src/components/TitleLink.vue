<template>
  <a-menu-item @click="open(url)">
    {{ title }}
  </a-menu-item>
</template>

<script setup lang="ts">

interface TitleLinkProps {
  url: string
  title: string
}
defineProps<TitleLinkProps>();

const { shell } = require('electron');

function open (url: string) {
  shell.openExternal(url);
}
</script>

<style scope lang="less"></style>
