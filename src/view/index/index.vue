<template>
    <a-card class="box-shadow-base">
        <p class="font-v1" style="font-size: 42px; padding: 0px; margin: 0px">
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
                        v{{ json.version }}
                    </a-descriptions-item>
                    <a-descriptions-item label="作者">
                        {{ json.author }}
                    </a-descriptions-item>

                    <a-descriptions-item label="项目地址">
                        <a :href="json.homepage">{{ json.homepage }}</a>
                    </a-descriptions-item>
                    <a-descriptions-item label="BUG反馈">
                        <a :href="json.bugs.url">{{ json.bugs.url }}</a>
                    </a-descriptions-item>
                </a-descriptions>
            </div>
        </div>

        <p>
            <md-render
                codeStyle="github-dark"
                renderKey="1"
                style="text-align: left; letter-spacing: 1px"
                raw
                @copy="onCopy"
            >
                <pre>
                **** 
                # 使用须知
                - 本软件完全开源免费，**谨防上当受骗** ，禁止用于商业用途，仅供学习交流使用
                - 此软件不会收集您的个人信息，所有信息均保存到本地
                - 此软件涉及到的脚本如有任何侵权行为，请联系作者进行删除
                - 如有任何疑问，请到BUG反馈处反馈，或者直接联系作者邮箱 **enncyemail@qq.com**

                ## **更多详细的使用教程，请移步** : https://ocs.enncy.cn/
            </pre>
            </md-render>

            
        </p>
     
    </a-card>
</template>

<script setup lang="ts">
import json from "root/package.json";
import { MdRender } from "mark-ui";
import { message } from "ant-design-vue";
 

function onCopy() {
    message.success("复制成功!");
}
</script>

<style scope lang="less">
.ant-descriptions-item {
    padding-bottom: 4px !important;
}
</style>
