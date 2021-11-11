<template>
    <div style="text-align: left" class="padding-top-6">
        <span class="space-10 ai-center flex">
            <!-- 前置插槽 -->
            <slot name="befor"></slot>
            <span class="flex nowrap space-10 ai-baseline" style="width: fit-content">
                <!-- 标签插槽 -->
                <slot name="label">
                    <span
                        style="white-space: nowrap"
                        :style="fontBold ? { fontWeight: 'bold' } : {}"
                        >{{ label ? label + " :" : "" }}
                    </span>
                </slot>
                <!-- 内容插槽 -->
                <span class="flex" style="width: fit-content; text-align: left">
                    <slot>{{ text }} </slot>
                </span>
            </span>
            <!-- 后置插槽 -->
            <span class="flex" style="width: fit-content">
                <slot name="after"> </slot>
            </span>
            <!-- 描述插槽 -->
            <slot name="description">
                <a-popover v-if="description" placement="rightTop">
                    <template #content>
                        <!-- 是否开启 markdown ? -->
                        <div v-if="md">
                            <MdRender :content="description" />
                        </div>
                        <div v-else>{{ description }}</div>
                    </template>
                    <QuestionCircleOutlined />
                </a-popover>
            </slot>
        </span>
    </div>
</template>

<script setup lang="ts">
import { MdRender } from "mark-ui";

interface ItemProps {
    label?: string;
    description?: string;
    // 提示框是否启用 markdown
    md?: boolean;
    text?: any;
    fontBold?: boolean;
}

defineProps<ItemProps>();
</script>

<style scope lang="less"></style>
