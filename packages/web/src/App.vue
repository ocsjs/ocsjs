<template>
    <div class="main h-100">
        <Title></Title>
        <Index></Index>
    </div>
</template>

<script setup lang="ts">
import Index from "./pages/index.vue";
import Title from "./components/Title.vue";
</script>

<style lang="less">
@import "@/assets/css/bootstrap.min.css";
@import "@/assets/css/common.css";

.main {
    display: grid;
    grid-template-rows: 28px auto;
    grid-template-areas:
        "header"
        "main ";
}
</style>
