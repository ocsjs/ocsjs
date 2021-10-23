<template>
    <div id="task-layout">
        <div
            v-if="tasks.length === 0"
            style="width: 100%; height: 100%"
            class="flex jc-center ac-center ai-center"
        >
            <a-empty description=""> 请在账号管理界面选择账号启动 </a-empty>
        </div>

        <template v-else>
            <div v-for="task of tasks">
                <Card
                    v-if="task.target && task.course && task.user"
                    color="blue"
                    @mousemove="hoverId = task.course.id"
                    @mouseleave="hoverId = ''"
                >
                    <template #title>
                        <a-row class="flex">
                            <a-col :span="8">
                                <span class="flex jc-flex-start ai-baseline space-10">
                                    <span
                                        >{{ task.user.name }} -
                                        {{ task.course.name }}</span
                                    >
                                </span>
                            </a-col>

                            <a-col :span="16">
                                <transition name="fade">
                                    <span
                                        v-show="hoverId === task.course.id"
                                        class="flex jc-flex-end ai-center ac-center space-10"
                                    >
                                        <a-popover content="任务置顶">
                                            <a-button
                                                type="primary"
                                                shape="circle"
                                                size="small"
                                            >
                                                <template #icon>
                                                    <ToTopOutlined />
                                                </template>
                                            </a-button>
                                        </a-popover>

                                        <a-popover content="详情">
                                            <a-button
                                                type="primary"
                                                shape="circle"
                                                size="small"
                                                @click="showDetail(task.target)"
                                            >
                                                <template #icon>
                                                    <BarsOutlined />
                                                </template>
                                            </a-button>
                                        </a-popover>
                                        <a-popover content="关闭任务">
                                            <a-button
                                                type="primary"
                                                shape="circle"
                                                danger
                                                size="small"
                                            >
                                                <template #icon>
                                                    <CloseOutlined />
                                                </template>
                                            </a-button>
                                        </a-popover>
                                    </span>
                                </transition>
                            </a-col>
                        </a-row>
                    </template>

                    <template #body>
                        <a-collapse :bordered="false" style="text-align: left">
                            <a-collapse-panel
                                style="
                                    background: #f7f7f7;
                                    border-radius: 4px;

                                    border: 0;
                                    overflow: hidden;
                                "
                                :header="
                                    `[${processTask(task)?.name}] : ` +
                                    (processTask(task)?.msg ||
                                        formatTaskStatus(task.target) ||
                                        '')
                                "
                            >
                                <a-steps direction="vertical" size="small">
                                    <a-step
                                        v-for="(task, index) in TaskToList(task.target)"
                                        :key="index"
                                        :title="task.name"
                                        :status="task.status"
                                        :sub-title="
                                            task.createTime
                                                ? new Date(
                                                      task.createTime
                                                  ).toLocaleString()
                                                : ''
                                        "
                                    >
                                        <template #description>
                                            <div v-text="formatTaskStatus(task)"></div>
                                        </template>
                                        <template v-if="task.status === 'process'" #icon>
                                            <LoadingOutlined />
                                        </template>
                                    </a-step>
                                </a-steps>
                            </a-collapse-panel>
                        </a-collapse>
                    </template>
                </Card>
            </div>
        </template>

        <a-modal v-model:visible="visible" :footer="false">
            <a-descriptions
                v-if="showTask"
                :column="1"
                :labelStyle="{ fontWeight: 'bold' }"
            >
                <a-descriptions-item label="当前任务名">
                    {{ showTask.name }}
                </a-descriptions-item>
                <a-descriptions-item label="运行状态">
                    {{ formatTaskStatus(showTask)  }}
                </a-descriptions-item>
                <a-descriptions-item label="开始时间">
                    {{ new Date(showTask.createTime).toLocaleString() }}
                </a-descriptions-item>
                <a-descriptions-item label="任务编号">
                    {{ showTask.id }}
                </a-descriptions-item>
            </a-descriptions>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { CourseTask, tasks, TaskToList } from "./task";
import Card from "@/components/common/Card.vue";
import { ref } from "@vue/reactivity";
import { BaseTask } from "app/types";

// 当前 hover 的卡片组件
const hoverId = ref("");

// 详情框
const visible = ref(false);

// 展示详情的临时task变量
const showTask = ref<any | undefined>(undefined);

function processTask(task: CourseTask) {
    const process = TaskToList(task.target).filter((t) => t.status === "process");
    return process[process.length - 1];
}

function showDetail(task: any) {
    showTask.value = task;
    visible.value = true;
}
function formatTaskStatus(task: BaseTask<any>) {
    return task.msg
        ? task.msg
        : task.status === "wait"
        ? "等待中"
        : task.status === "process"
        ? "正在运行"
        : task.status === "finish"
        ? "已完成"
        : "错误";
}
</script>

<style scope lang="less">
#task-layout {
    text-align: center;
    height: 100%;
    padding: 24px 50px;
    background-color: #f8f8f8;
    overflow: auto;
}

#app {
    .ant-steps-item-content {
        white-space: nowrap;
        width: fit-content;
    }

    .ant-steps-item-description {
        text-align: left;
        white-space: nowrap;
    }
}
</style>
