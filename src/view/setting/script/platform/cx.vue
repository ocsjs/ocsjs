<template>
    <div>
        <card color="gray" title="全局设置" size="small" :open-collapse="false">
            <item label="任务超时检测">
                <a-input-number
                    size="small"
                    v-model:value="script.taskTimeoutPeriod"
                    :min="0.5"
                    :max="24"
                    :step="0.5"
                    :formatter="(v:any)=>v+' 小时/次'"
                >
                </a-input-number> </item
        ></card>
        <card
            color="gray"
            title="学习设置"
            size="small"
            :open-collapse="false"
            :collapse="false"
        >
            <item label="开启学习">
                <a-switch v-model:checked="cx.study.enable" />
            </item>
            <template v-if="cx.study.enable">
                <item
                    label="队列模式"
                    description="`开启` 一个一个的执行任务<br>`关闭` 一个页面的全部任务一起执行"
                    md
                >
                    <a-switch v-model:checked="cx.study.queue" />
                </item>
                <item
                    label="复习模式"
                    md
                    description="`开启`:`重新刷已经完成的章节`，并且可以手动点击指定的章节，脚本会自动下一章<br>`关闭`:脚本将自动跳转到需要刷课的章节开始刷课"
                >
                    <a-switch v-model:checked="cx.study.review" />
                </item>
                <item label="自动播放音视频">
                    <a-switch v-model:checked="cx.study.media.enable" />
                </item>
                <template v-if="cx.study.media.enable">
                    <div class="margin-left-24">
                        <item label="静音">
                            <a-switch v-model:checked="cx.study.media.mute" />
                        </item>
                        <item
                            label="倍速"
                            description="`倍速可能会导致挂科`，观看时长后台可以看到，实际观看时间`不等于`播放时间！，如果课程严格请谨慎选择倍速，否则`后果自负`！"
                            md
                        >
                            <a-input-number
                                size="small"
                                v-model:value="cx.study.media.playbackRate"
                                :min="1"
                                :max="16"
                            ></a-input-number>
                        </item>
                    </div>
                </template>

                <item label="自动播放PPT">
                    <a-switch v-model:checked="cx.study.ppt" />
                </item>
                <item label="自动翻阅图书">
                    <a-switch v-model:checked="cx.study.book" />
                </item>
                <item label="自动做章节测验">
                    <a-switch v-model:checked="cx.study.qa.enable" />
                </item>
                <div v-if="cx.study.qa.enable" class="margin-left-24">
                    <item label="章节测验自动提交">
                        <a-switch v-model:checked="cx.study.qa.autoReport" />
                    </item>
                    <item
                        label="根据搜题成功率自动提交"
                        md
                        description="`默认为60%`，意思就是如果有`10`个题目，脚本成功搜索的题目:<br>`大于等于6题`则`自动提交`<br>`小于6题` 则`暂时保存`"
                    >
                        <a-input-number
                            size="small"
                            v-model:value="cx.study.qa.passRate"
                            :min="0"
                            :max="100"
                            :step="10"
                            :formatter="(v:any)=>v+' %'"
                        ></a-input-number>
                    </item>
                </div>
            </template>
        </card>

        <item label="自动做作业">
            <a-switch v-model:checked="cx.work.enable" />
        </item>

        <item label="自动考试">
            <a-switch v-model:checked="cx.exam.enable" />
        </item>
    </div>
</template>

<script setup lang="ts">
import { config } from "@/utils/store";

const cx = config.setting.script.script.cx;
const script = config.setting.script.script;
</script>

<style scope lang="less"></style>
