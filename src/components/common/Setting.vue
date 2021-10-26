<template>
    <div style="text-align: left" class="margin-top-4" >
        <span class="space-10 ai-center">
            <span> <slot name="befor"></slot> </span>
            <span>
                <span :style="fontBold ? { fontWeight: 'bold' } : {}">{{ label }} : </span>
                <slot>{{ text }} </slot>
            </span>
            <span> <slot name="after"></slot> </span>
            <a-popover v-if="description" placement="rightTop" :content="description">
                <QuestionCircleOutlined />
            </a-popover>
        </span>
    </div>
</template>

<script setup lang="ts">
import { QuestionCircleOutlined } from "@ant-design/icons-vue";

defineProps<{
    label?: string;
    description?: string;
    text?: any;
    fontBold?: boolean;
}>();
</script>

<style scope lang="less"></style>
