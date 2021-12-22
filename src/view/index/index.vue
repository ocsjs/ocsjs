<template>
    <div>
        <p class="font-v1" style="font-size: 42px; padding: 0px; margin: 24px 0px">
            OCS <span class="font-v1">{{ json.name }} </span>
        </p>
        <p>
            {{ json.description }}
        </p>
        <p class="space-8">
            <img
                alt="GitHub Repo stars"
                src="https://img.shields.io/github/stars/enncy/online-course-script"
            />
            <img
                alt="GitHub"
                src="https://img.shields.io/github/license/enncy/online-course-script"
            />
            <img
                alt="GitHub package.json version (branch)"
                src="https://img.shields.io/github/package-json/v/enncy/online-course-script/v1.0"
            />
            <img
                alt="GitHub repo size"
                src="https://img.shields.io/github/repo-size/enncy/online-course-script"
            />
        </p>
        <div style="width: 100%; text-align: left">
            <div style="width: 450px; margin: 0 auto">
                <a-descriptions :column="1" :labelStyle="{ fontWeight: 'bold' }">
                    <a-descriptions-item label="项目名">
                        {{ json.name }}
                    </a-descriptions-item>
                    <a-descriptions-item label="版本">
                        v{{ json.version }}
                    </a-descriptions-item>
                    <a-descriptions-item label="作者">
                        {{ json.author }}
                    </a-descriptions-item>
                    <a-descriptions-item label="教程">
                        <a href="https://ocs.enncy.cn/">https://ocs.enncy.cn/</a>
                    </a-descriptions-item>

                    <a-descriptions-item label="项目地址">
                        <a :href="json.homepage">{{ json.homepage }}</a>
                    </a-descriptions-item>

                    <a-descriptions-item label="讨论区">
                        <a
                            href="https://github.com/enncy/online-course-script/discussions"
                            >https://github.com/enncy/online-course-script/discussions</a
                        >
                    </a-descriptions-item>

                    <a-descriptions-item label="BUG反馈">
                        <a :href="json.bugs.url">{{ json.bugs.url }}</a>
                    </a-descriptions-item>
                </a-descriptions>
            </div>
        </div>

        <a-modal :visible="visible"  :keyboard="false" :footer="null" :maskClosable="false" :closable="false" >
            <h3>欢迎使用OCS,请完成您开始前的一些配置</h3>
            <div class="padding-12">
                <Guide @done="done"/>
            </div>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import json from "root/package.json";
 
import { config } from "@/utils/store";
import { ref } from "@vue/reactivity";
import Guide from "./guide.vue";
import { message } from "ant-design-vue";

const visible = ref(false);

// 如果未初始化
if (!config?.setting?.script?.account?.queryToken || !config?.setting?.script?.launch?.binaryPath) {
    visible.value = true;
}

function done(){
    visible.value = !visible.value
    message.success('初始化配置完成！')
}
</script>

<style scope lang="less">
.ant-descriptions-item {
    padding-bottom: 4px !important;
}
</style>
