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
            size === 'large' ? largeStyle : size === 'small' ? smallStyle : defaultStyle
        "
    >
        <div
            class="font-v2 flex ai-center space-10"
            style="white-space: nowrap"
            :class="`${title ? 'title' : ''} ${openCollapse ? 'pointer' : ''}`"
            @click="onCollapse"
        >
            <!-- 如果没有标题则不显示 -->
            <a-badge v-if="color" :color="color || 'gray'" />
            <!-- 标题 -->
            <slot name="title">
                {{ title }}
            </slot>
            <!-- 折叠效果图标 -->
            <template v-if="openCollapse">
                <CaretDownOutlined v-if="collapse" />
                <CaretUpOutlined v-else />
            </template>
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
        </div>

        <!-- 是否开启折叠效果 -->
        <template v-if="openCollapse === false">
            <div class="body">
                <slot name="body">
                    <slot></slot>
                </slot>
            </div>
        </template>
        <template v-else>
            <transition name="collapse">
                <keep-alive>
                    <div
                        ref="cardBody"
                        class="body"
                        :style="size === 'small' ? { padding: '0px 18px' } : {}"
                        v-show="openCollapse ? collapse : false"
                    >
                        <slot name="body">
                            <slot></slot>
                        </slot>
                    </div>
                </keep-alive>
            </transition>
        </template>
    </div>
</template>

<script setup lang="ts">
import { toRefs } from "@vue/reactivity";
import { MdRender } from "mark-ui";
import { ref } from "vue";
import { Color } from ".";

interface CardProps {
    color?: keyof Color | boolean;
    title?: string;
    // 详情描述
    description?: string;
    // 是否开启 markdown 功能
    md?: boolean;
    size?: "small" | "default" | "large";
    // 是否开启折叠效果，优先级比 collapse 高
    openCollapse?: boolean;
    collapse?: boolean;
}

const props = withDefaults(defineProps<CardProps>(), {
    color: "blue",
    title: "",
    description: "",
    size: "large",
    openCollapse: true,
    collapse: true,
    md: false,
});

const emits = defineEmits<{
    (e: "update:collapse", collapse: boolean): void;
}>();

let { color, title, size, openCollapse, description, collapse, md } = toRefs(props);

// 计算卡片的高度值，然后才能进行折叠

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

function onCollapse() {
    // 计算高度
    if (!height.value) {
        height.value = cardBody.value.offsetHeight;
        cardBody.value.style.height = height.value + "px";
        console.log("height.value", height.value);
    }
    // 折叠
    if (openCollapse.value) {
        if (collapse) {
            collapse.value = !collapse.value;
            emits("update:collapse", collapse.value);
        }
    }
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
