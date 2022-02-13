<template>
    <div class="text-start m-2">
        <p class="ps-2 mb-2" v-if="title"><a-badge :color="badge" /> {{ title }}</p>
        <div class="bg-white rounded p-3" :class="shadow ? 'shadow-sm' : ''">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs } from "vue";
interface CardProps {
    title?: string;
    shadow?: boolean;
    badge?: string;
}
const props = withDefaults(defineProps<CardProps>(), {
    title: "",
    shadow: true,
    badge: "gray",
});
const { title, shadow } = toRefs(props);
</script>

<style scope lang="less">
#app .ant-badge-status-dot {
    height: 20px;
    border-radius: 4px;
}
</style>
