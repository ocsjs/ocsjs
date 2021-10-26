<template>
    <!-- 
    - size : string 卡片大小
    - title : slot|string 标题
    - body : slot|default slot 卡片内容
    - openCollapse 控制是否开启折叠面板
    - collapse 控制折叠面板的折叠与展开
  -->
    <div
        class="card"
        :style="
            !size || size === 'large'
                ? largeStyle
                : size === 'small'
                ? smallStyle
                : defaultStyle
        "
    >
        <div
            class="font-v2 flex ai-center space-10"
            :class="`${title ? 'title' : ''} ${closeCollapse ? '' : 'pointer'}`"
            @click="
                () => {
                    if (!closeCollapse) collapse = !collapse;
                }
            "
        >
            <!-- 如果没有标题则不显示 -->
            <a-badge v-if="color" :color="color || 'gray'" />
            <slot name="title">
                {{ title }}
            </slot>

            <a-popover v-if="description" placement="rightTop" :content="description">
                <QuestionCircleOutlined />
            </a-popover>

            <template v-if="!closeCollapse">
                <CaretDownOutlined v-if="collapse" />
                <CaretUpOutlined v-else />
            </template>
        </div>
        <transition name="fade">
            <div
                class="body"
                :style="size === 'small' ? { padding: '0px 18px' } : {}"
                v-show="closeCollapse ? true : collapse"
            >
                <slot name="body">
                    <slot></slot>
                </slot>
            </div>
        </transition>
    </div>
</template>
 
<script setup lang="ts">
import { toRefs } from "@vue/reactivity";
import { ref } from "vue";
import { Color } from ".";

const props = defineProps<{
    color?: keyof Color;
    title?: string;
    // 详情描述
    description?: string;
    size?: "small" | "default" | "large";
    // 是否开启折叠效果，优先级比 collapse 高
    closeCollapse?: boolean;
}>();

let { color, title, size, closeCollapse, description } = toRefs(props);

const collapse = ref(true);

const largeStyle = {
    margin: "8px",
    padding: "12px",
};

const defaultStyle = {
    margin: "2px",
    padding: "6px",
};

const smallStyle = {
    margin: "0px",
    padding: "0px",
};
</script>

<style scope lang="less">
.card {
    border-radius: 4px;
    background-color: white;

    .title {
        padding: 4px;
    }

    .body {
        padding: 8px 18px;
    }
}

#app .ant-badge-status-dot {
    height: 20px;
    border-radius: 4px;
}

.pointer {
    cursor: pointer;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
