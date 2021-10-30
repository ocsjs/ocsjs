<template>
    <div style="text-align: left" class="padding-top-6">
        <span class="space-10 ai-center flex">
            <slot name="befor"></slot>
            <span class="flex nowrap space-10" style="width: fit-content">
                <slot name="label">
                    <span :style="fontBold ? { fontWeight: 'bold' } : {}"
                    >{{ label ? label + " :" : "" }}
                </span>
                </slot>
                <span class="flex" style="width: fit-content;text-align: left;">
                    <slot>{{ text }} </slot>
                </span>
            </span>
            <span class="flex" style="width: fit-content"
                ><slot name="after"></slot
            ></span>
            <a-popover v-if="description" placement="rightTop" :content="description">
                <QuestionCircleOutlined />
            </a-popover>
        </span>
    </div>
</template>

<script setup lang="ts">
 

defineProps<{
    label?: string;
    description?: string;
    text?: any;
    fontBold?: boolean;
}>();
</script>

<style scope lang="less"></style>
