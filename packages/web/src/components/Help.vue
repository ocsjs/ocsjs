<template>
    <div class="text-start text-secondary w-100">
        <div class="m-auto help-content">
            <p>鼠标<key>左键</key>打开 (.ocs) 文件进行编辑或者运行</p>
            <p>鼠标<key>右键</key>显示文件菜单</p>
            <p>鼠标<key>左键</key>拖拽移动文件</p>
        </div>
    </div>
</template>

<script setup lang="ts"></script>

<style scope lang="less">
.help-content {
    width: fit-content;
}

key {
    padding: 2px;
    margin: 0px 4px 0px 4px;
    border-radius: 3px;
    color: #5e6163;
    background: linear-gradient(-225deg, #d5dbe4, #f8f8f8);
    box-shadow: inset 0 -2px 0 0 #cdcde6, inset 0 0 1px 1px #fff,
        0 1px 2px 1px rgba(30, 35, 90, 0.4);
}
</style>
