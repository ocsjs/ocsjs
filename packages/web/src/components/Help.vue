<template>
    <div class="text-start text-secondary w-100">
        <div class="m-auto help-content">
            <p>鼠标<Key>左键</Key>点击文件进行编辑或者运行</p>
            <p>鼠标<Key>右键</Key>点击文件显示文件菜单</p>
            <p>鼠标<Key>左键</Key>拖拽移动文件</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import Key from "./Key.vue";
</script>

<style scope lang="less">
.help-content {
    width: fit-content;
}
</style>
