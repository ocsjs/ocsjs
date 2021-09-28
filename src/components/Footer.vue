<template>
    <div class="font-v4 flex nowrap height-24">
        <div class="flex nowrap space-10 jc-flex-start ai-center">
            <li>{{ json.name }} - v{{ json.version }}</li>
            <!-- 路由信息 -->
            <!-- <li class="space-4">
                <span v-for="(info, i) of routesInfo" class="space-4">
                    <span v-if="i !== 0"> / </span>
                    <span>{{ info }}</span>
                </span>
            </li> -->
        </div>

        <div class="flex nowrap space-10 jc-flex-end ai-center">
            <span style="cursor: pointer">
                <QuestionCircleOutlined title="关于" class="font-v2" @click="$router.push('/')" />
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "@vue/reactivity";
import json from "root/package.json";
import { useRouter } from "vue-router";
// const router = useRouter();
// const routesInfo = ref<any[]>([]);
// router.beforeEach((to, from) => {
//     routesInfo.value = to.matched.map((route) => route.meta.desc);
// });
</script>

<style scope lang="less"></style>
