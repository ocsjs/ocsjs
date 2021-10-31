<template>
    <div>
        <card title="任务设置">
            <item label="最大任务数量" font-bold>
                <span class="space-10">
                    <a-input-number
                        size="small"
                        v-model:value="common.task.maxTasks"
                        :min="1"
                        :max="20"
                    ></a-input-number>

                    <a-popover
                        placement="rightTop"
                        content="任务列表里面的最大任务数量，每一个启动的浏览器就代表一个任务，如果任务过多可能会导致电脑卡顿，请谨慎设置"
                    >
                        <QuestionCircleOutlined />
                    </a-popover>
                </span>
            </item>
        </card>
    </div>
</template>

<script setup lang="ts">
import { setting } from "./setting";
import Card from "@/components/common/Card.vue";
import Item from "@/components/common/item.vue";

const { common } = setting;
</script>

<style scope lang="less"></style>
