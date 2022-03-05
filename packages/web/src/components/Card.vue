<template>
    <div class="text-start">
        <div class="bg-white rounded p-3 pt-1">
            <p class="mb-2 title fw-bold border-bottom" v-if="title">
                {{ title }}
            </p>

            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs } from "vue";
interface CardProps {
    title?: string;

    badge?: string;
}
const props = withDefaults(defineProps<CardProps>(), {
    title: "",

    badge: "gray",
});
const { title } = toRefs(props);
</script>

<style scope lang="less">
#app .ant-badge-status-dot {
    height: 16px;
    border-radius: 4px;
}

.title {
    font-size: 1rem;
}
</style>
