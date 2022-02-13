<template>
    <div class="about text-center p-2 col-12 col-md-10 col-lg-8">
        <Card title="软件信息">
            <Description label="软件名" :desc="store.get('name')" />
            <Description label="版本" :desc="store.get('version')" />
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
.about {
    margin: 0 auto;
    display: grid;
    grid-row-gap: 20px;
    grid-template-rows: repeat(auto-fill);
}
</style>
