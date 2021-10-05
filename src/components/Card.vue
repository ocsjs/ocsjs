<template>
    <div class="card">
        <div class="title font-v2 flex ai-center">
            <a-badge :color="color" />

            <slot name="title"></slot>
        </div>
        <div class="body">
            <slot name="body"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { toRefs } from "@vue/reactivity";
interface Color {
    pink:string
    red:string
    yellow:string
    orange:string
    cyan:string
    green:string
    blue:string
    purple:string
    geekblue:string
    magenta:string
    volcano:string
    gold:string
    lime:string
}
const props = defineProps<{
    color: keyof Color;
}>();

const { color } = toRefs(props);
</script>

<style scope lang="less">
.card {
    margin: 8px;
    padding: 12px;
    border-radius: 4px;
    background-color: white;

    .title {
        padding: 4px;
    }

    .body {
        padding: 4px 18px;
    }
}

#app .ant-badge-status-dot {
    height: 20px;

    border-radius: 4px;
}
</style>
