<template>
	<a-doption @click="open(url)">
		{{ title }}
	</a-doption>
</template>

<script setup lang="ts">
import { electron } from '../utils/node';

interface TitleLinkProps {
	url: string;
	title: string;
}
defineProps<TitleLinkProps>();

const { shell } = electron;

function open(url: string) {
	shell.openExternal(url);
}
</script>

<style scoped lang="less"></style>
