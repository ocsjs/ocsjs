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

const contextmenu: Ref<HTMLElement> = ref() as any;
const container: Ref<HTMLElement> = ref() as any;

onMounted(() => {
    document.addEventListener("click", () => {
        contextmenu.value.style.display = "none";
    });

    //右键菜单单击
    container.value.oncontextmenu = function (event) {
        var x = event.clientX;
        var y = event.clientY;
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

    box-shadow: 0px 0px 8px rgb(232, 232, 232);
}

body #app .contextmenu .ant-menu-item {
    color: #2c3e50;
    margin: 0;
    background-color: white;

    &:hover {
        background-color: #e6f7ff;
        color: #1890ff;
    }
}
</style>
