<template>
    <div class="setting text-center p-2 col-12 col-md-10 col-lg-8">
        <Card title="基本设置">
            <Description label="测试" desc="测试" />
        </Card>

        <Card title="路径设置">
            <Description label="位置" :desc="store.get('path')" />
            <Description label="数据路径" :desc="store.get('user-data-path')" />
            <Description label="二进制文件路径" :desc="store.get('exe-path')" />
            <Description label="日志路径" :desc="store.get('logs-path')" />
        </Card>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs } from "vue";
import Card from "../../components/Card.vue";
import Description from "../../components/Description.vue";

const Store = require("electron-store");
const store = new Store();
</script>

<style scope lang="less">
.setting {
    margin: 0 auto;
    display: grid;
    grid-row-gap: 20px;
    grid-template-rows: repeat(auto-fill);
}
</style>
