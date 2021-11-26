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
            <div>
                <span>当前有 {{ tasks.length }} 个任务运行中</span>

                <a-popconfirm
                    title="确定关闭所有任务吗？浏览器也会一同关闭"
                    ok-text="确定"
                    cancel-text="取消"
                    @confirm="closeAllTask"
                >
                    <a-button
                        class="margin-left-24"
                        type="primary"
                        shape="round"
                        size="small"
                        danger
                    >
                        <template #icon>
                            <DeleteOutlined />
                            关闭所有
                        </template>
                    </a-button>
                </a-popconfirm>
            </div>

            <div v-for="task of tasks">
                <Card
                    v-if="task.target && task.course && task.user"
                    @mousemove="hoverId = task.course.id"
                    @mouseleave="hoverId = ''"
                >
                    <template #title>
                        <span @click="collapse = !collapse">
                            {{ task.user.name }} -
                            {{ PlatformAlias[task.user.platform].split("-")[0] }} -
                            {{ task.course.name }}</span
                        >
                    </template>

                    <template #description>
                        <span v-show="collapse" class="font-v3">
                            <a-badge :status="statusDot(task.target)" />
                            {{ currentMsg(task) }}
                        </span>
                        <transition name="fade">
                            <span
                                v-show="hoverId === task.course.id"
                                class="flex jc-flex-end ai-center ac-center space-10"
                                style="height: 0px"
                            >
                                <a-popover content="关闭任务">
                                    <a-button
                                        type="primary"
                                        shape="circle"
                                        size="small"
                                        @click="closeTask(task.target)"
                                        danger
                                    >
                                        <template #icon>
                                            <DeleteOutlined />
                                        </template>
                                    </a-button>
                                </a-popover>

                                <a-popover content="详情">
                                    <a-button
                                        type="primary"
                                        shape="circle"
                                        size="small"
                                        @click="showDetail(task)"
                                    >
                                        <template #icon>
                                            <BarsOutlined />
                                        </template>
                                    </a-button>
                                </a-popover>
                            </span>
                        </transition>
                    </template>

                    <template #body>
                        <div class="padding-12">
                            <a-steps direction="vertical" size="small">
                                <a-step
                                    v-for="(task, index) in TaskToList(task.target)"
                                    :key="index"
                                    :title="task.name"
                                    :status="task.status"
                                >
                                    <template #description>
                                        <div v-text="formatTaskStatus(task)"></div>
                                    </template>
                                    <template v-if="task.status === 'process'" #icon>
                                        <LoadingOutlined />
                                    </template>
                                </a-step>
                            </a-steps>
                        </div>
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
                <a-descriptions-item label="账号">
                    {{ showTask.user.name }}
                </a-descriptions-item>
                <a-descriptions-item label="运行平台">
                    {{ showTask.course.platform }}
                </a-descriptions-item>
                <a-descriptions-item label="课程名">
                    {{ showTask.course.name }}
                </a-descriptions-item>
                <a-descriptions-item label="课程简介">
                    {{ showTask.course.profile }}
                </a-descriptions-item>
                <a-descriptions-item label="账号">
                    {{ showTask.user.name }}
                </a-descriptions-item>
                <a-descriptions-item label="当前任务名">
                    {{ showTask.target.name }}
                </a-descriptions-item>
                <a-descriptions-item label="运行状态">
                    {{ formatTaskStatus(showTask.target) }}
                </a-descriptions-item>
                <a-descriptions-item label="开始时间">
                    {{
                        showTask.target.createTime
                            ? new Date(showTask.target.createTime).toLocaleString()
                            : "未知"
                    }}
                </a-descriptions-item>
                <a-descriptions-item label="任务编号">
                    {{ showTask.target.id }}
                </a-descriptions-item>
            </a-descriptions>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { CourseTask, tasks, TaskToList } from "./task";
import Card from "@/components/common/Card.vue";
import { ref } from "@vue/reactivity";
import { PlatformAlias, BaseTask } from "app/types";
import { Task } from "app/electron/task";
import { Remote } from "@/utils/remote";

// 当前 hover 的卡片组件
const hoverId = ref("");

// 详情框
const visible = ref(false);

const collapse = ref(false);

// 展示详情的临时task变量
const showTask = ref<CourseTask | undefined>(undefined);

function currentMsg(task: CourseTask) {
    const all = TaskToList(task.target);
    let process =
        all.filter((t) => t.status === "process").pop() ||
        all.filter((t) => t.status === "finish").pop() ||
        all[0];
    if (process) {
        const t = process;
        return `[${t?.name || "未知任务名"}] : ` + formatTaskStatus(t);
    } else {
        return "任务全部完成";
    }
}

function statusDot(task: Task) {
    task.status === "process"
        ? "processing"
        : task.status === "finish"
        ? "success"
        : task.status === "wait"
        ? "default"
        : task.status === "warn"
        ? "warning"
        : "error";
}

function showDetail(task: CourseTask) {
    showTask.value = task;
    visible.value = true;
}
function formatTaskStatus(task: Task) {
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

function closeTask(task: Task) {
    tasks.value = tasks.value.filter((t) => t.target.id !== task.id);
    Remote.script.call("close", task.id);
}

function closeAllTask() {
    tasks.value.forEach((task) => {
        Remote.script.call("close", task.target.id);
    });
    tasks.value = [];
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
        text-align: left;
    }
}
</style>
