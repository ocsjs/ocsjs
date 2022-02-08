<template>
    <div class="home">
        <Title></Title>
        <div class="container">
            <h1>Hello OCS</h1>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs } from "vue";
import Title from "../components/Title.vue";
</script>

<style scope lang="less">
.home {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
}
</style>
