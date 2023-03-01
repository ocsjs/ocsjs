<template>
	<div
		class="markdown-text"
		v-html="md"
	></div>
</template>
<script setup lang="ts">
import '@/assets/css/markdown-text.css';
import 'video.js/dist/video-js.css';
import '@/assets/css/container.css';

import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import videojs from 'video.js';
import { markdownIt } from '../utils/markdown';

const props = defineProps<{
	content: string;
}>();

const md = computed(() => markdownIt.render(props.content));

/**
 *  解析视频
 */
const players = ref<any[]>([]);

onMounted(() => {
	nextTick(() => {
		const videos = Array.from(document.querySelectorAll('.video-js')) as HTMLElement[];
		for (const video of videos) {
			const options: any = {
				bigPlayButton: true,
				controls: true,
				playbackRates: [1, 1.5, 2],
				fluid: true
			};
			const player = videojs(video, options);
			player.addClass('w-100');
			player.volume(0.3);
			players.value.push(player);
		}
	});
});

onBeforeUnmount(() => {
	for (const player of players.value) {
		player.dispose();
	}
});
</script>
<style scoped lang="less"></style>
