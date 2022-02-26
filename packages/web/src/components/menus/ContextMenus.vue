<template>
    <div class="h-100">
        <div ref="container" class="h-100">
            <slot></slot>
        </div>
        <div ref="contextmenu" class="contextmenu">
            <slot name="overlay" class="rounded"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onMounted, Ref } from "vue";

let contextmenu: Ref<HTMLElement> = ref() as any;
let container: Ref<HTMLElement> = ref() as any;

onMounted(() => {
    let height = contextmenu.value.clientHeight;
    document.addEventListener("mousedown", () => {
        height = contextmenu.value.clientHeight;
        contextmenu.value.style.display = "none";
    });

    //右键菜单单击
    container.value.oncontextmenu = function (event) {
        var x = event.clientX;
        var y = event.clientY;

        if (y > document.body.clientHeight - height) {
            y = document.body.clientHeight - height - 30;
        }

        contextmenu.value.style.display = "block";
        contextmenu.value.style.left = x + 10 + "px";
        contextmenu.value.style.top = y + 10 + "px";

        return false;
    };
});
</script>

<style scope lang="less">
.contextmenu {
    display: none;
    position: fixed;
    width: 180px;
    z-index: 999;

    box-shadow: 0px 0px 8px rgb(232, 232, 232);

    ul {
        padding: 0 !important;
    }
}

body #app .contextmenu .ant-menu-item {
    color: #2c3e50;
    margin: 0;
    background-color: white;
    height: 32px;
    line-height: 32px;
    padding: 0 12px;

    .ant-menu-item-icon + span {
        margin-left: 2px;
    }

    .ant-menu-title-content {
        font-size: 12px;
    }

    &:hover {
        background-color: #e6f7ff;
        color: #1890ff;
    }
}
</style>
