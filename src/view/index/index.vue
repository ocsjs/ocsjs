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
                src="https://img.shields.io/github/stars/enncy/OnlineCourseScript"
            />
            <img
                alt="GitHub"
                src="https://img.shields.io/github/license/enncy/onlinecoursescript"
            />
            <img
                alt="GitHub package.json version (branch)"
                src="https://img.shields.io/github/package-json/v/enncy/onlinecoursescript/v1.0"
            />
            <img
                alt="GitHub repo size"
                src="https://img.shields.io/github/repo-size/enncy/OnlineCourseScript"
            />
        </p>
        <div style="width: 100%; text-align: left">
            <div style="width: 450px; margin: 0 auto">
                <a-descriptions :column="1" :labelStyle="{ fontWeight: 'bold' }">
                    <a-descriptions-item label="项目名">
                        {{ json.name }}
                    </a-descriptions-item>
                    <a-descriptions-item label="版本">
                        v{{ Remote.app.call("getVersion") }}
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
    </div>
</template>

<script setup lang="ts">
import json from "root/package.json";
import { Remote } from "@/utils/remote";
</script>

<style scope lang="less">
.ant-descriptions-item {
    padding-bottom: 4px !important;
}
</style>
