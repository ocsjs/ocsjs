<template>
    <Card
        :bordered="false"
        :color="color"
        :title="title"
        :size="size"
        :description="description"
        :close-collapse="closeCollapse"
    >
        <div>
            <slot></slot>
        </div>
    </Card>
</template>

<script setup lang="ts">
import { toRefs } from "vue";
import { Color } from ".";

import Card from "./Card.vue";

const props = defineProps<{
    color?: keyof Color;
    title?: string;
    description?: string;
    size?: "small" | "default" | "large";
    // 是否开启折叠效果，优先级比 collapse 高
    closeCollapse?: boolean;
}>();

let { color, title, size, closeCollapse, description } = toRefs(props);
</script>

<style scope lang="less">
#app .ant-descriptions-item-container {
    display: flex;
    align-items: baseline;
}
</style>
