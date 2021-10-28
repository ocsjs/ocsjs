<template>
    <div>
        <setting-card :bordered="false" color="blue" title="任务设置">
            <item size="small" label="最大任务数量">
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
        </setting-card>
        
    </div>
</template>

<script setup lang="ts">
import { setting } from "./setting";
import SettingCard from "@/components/common/SettingCard.vue";
import Item from "@/components/common/item.vue";

const { common } = setting;
</script>

<style scope lang="less"></style>
