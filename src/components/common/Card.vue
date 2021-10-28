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
            @click="openCollapse"
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
        <transition name="collapse">
            <keep-alive>
                <div
                    ref="cardBody"
                    class="body"
                    :style="size === 'small' ? { padding: '0px 18px' } : {}"
                    v-show="closeCollapse ? true : collapse"
                >
                    <slot name="body">
                        <slot></slot>
                    </slot>
                </div>
            </keep-alive>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { toRefs } from "@vue/reactivity";
import { nextTick, onMounted, ref, watch } from "vue";
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

// 计算卡片的高度值，然后才能进行折叠
const collapse = ref(true);
const height = ref<number>(0);
const cardBody = ref<any>(null);

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

function openCollapse() {
 
    // 计算高度
    if (!height.value) {
        height.value = cardBody.value.offsetHeight;
        cardBody.value.style.height = height.value + "px";
        console.log("height.value", height.value);
    }
    // 折叠
    if (!closeCollapse?.value) collapse.value = !collapse.value;
}
</script>

<style scope lang="less">
.card {
    height: fit-content;
    border-radius: 4px;
    background-color: white;

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
</style>
