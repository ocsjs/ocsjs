<template>
    <div>
        <item
            label="自动暂停"
            md
            description="智慧树如需获取`平时分`，每天都会有`限制`的时长，如果`超出则不能累积平时分`，请根据需求进行配置"
        >
            <a-input-number
                size="small"
                v-model:value="zhs.autoStop"
                :defaultValue="0.5"
                :min="0.5"
                :max="24"
                :step="0.5"
                :formatter="(v:any)=>v+' 小时后'"
            ></a-input-number>
        </item>

        <item label="自动播放视频">
            <a-switch v-model:checked="zhs.video.enable" />
        </item>
        <div v-if="zhs.video.enable" class="margin-left-24">
            <item label="静音">
                <a-switch v-model:checked="zhs.video.mute" />
            </item>
            <item label="倍速" md description="智慧树只能1-1.5倍速，否则会导致`封号`！">
                <a-input-number
                    size="small"
                    v-model:value="zhs.video.playbackRate"
                    :min="1"
                    :max="1.5"
                    :step="0.5"
                ></a-input-number>
            </item>
        </div>

        <item label="自动做章节测验">
            <a-switch v-model:checked="zhs.qa.enable" />
        </item>
        <div v-if="zhs.qa.enable" class="margin-left-24">
            <item label="章节测验自动提交">
                <a-switch v-model:checked="zhs.qa.autoReport" />
            </item>
            <item
                label="根据搜题成功率自动提交"
                md
                description="`默认为60%`，意思就是如果有`10`个题目，脚本成功搜索的题目:<br>`大于等于6题`则`自动提交`<br>`小于6题` 则`暂时保存`"
            >
                <a-input-number
                    size="small"
                    v-model:value="zhs.qa.passRate"
                    :min="0"
                    :max="100"
                    :step="10"
                    :formatter="(v:any)=>v+' %'"
                ></a-input-number>
            </item>
        </div>

        <item label="自动做作业">
            <a-switch v-model:checked="zhs.work.enable" />
        </item>

        <item label="自动考试">
            <a-switch v-model:checked="zhs.exam.enable" />
        </item>
    </div>
</template>

<script setup lang="ts">
import { config } from "@/utils/store";

const zhs = config.setting.script.script.zhs;
</script>

<style scope lang="less"></style>
