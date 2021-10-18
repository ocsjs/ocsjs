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
                    color="blue"
                    @mousemove="hoverId = task.name"
                    @mouseleave="hoverId = ''"
                >
                    <template #title>
                        <a-row class="flex">
                            <a-col :span="8">
                                <span class="flex jc-flex-start ai-baseline space-10">
                                    <span>{{ task.user.name }}</span>
                                    <span class="font-v4">
                                        {{ (task.user.loginInfo as any).phone || (task.user.loginInfo as any).uname  ||  (task.user.loginInfo as any).studentId }}
                                    </span>
                                </span>
                            </a-col>
                            <a-col :span="16">
                                <transition name="fade">
                                    <span
                                        v-show="hoverId === task.name"
                                        class="flex jc-flex-end ai-center ac-center space-10"
                                    >
                                        <a-popover v-if="task.pasue" content="开始">
                                            <PlayCircleFilled
                                                :style="{ fontSize: '22px' }"
                                                @click="task.pasue = !task.pasue"
                                            />
                                        </a-popover>
                                        <a-popover v-else content="暂停">
                                            <PauseCircleFilled
                                                :style="{ fontSize: '24px' }"
                                                @click="task.pasue = !task.pasue"
                                            />
                                        </a-popover>

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
                                                @click="showDetail(task)"
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
                                                @click="
                                                    () => {
                                                        tasks.splice(
                                                            tasks.findIndex(
                                                                (t) =>
                                                                    t.name === task.name
                                                            ),
                                                            1
                                                        );
                                                    }
                                                "
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
                </Card>
            </div>
        </template>

        <a-modal v-model:visible="visible" :footer="false">
            <a-descriptions
                v-if="showTask"
                :column="1"
                :labelStyle="{ fontWeight: 'bold' }"
            >
                <a-descriptions-item label="执行的脚本名">
                    {{ showTask.script }}
                </a-descriptions-item>
                <a-descriptions-item label="运行状态">
                    {{ showTask.pasue ? "暂停中" : "运行中" }}
                </a-descriptions-item>
                <template v-if="showTask.status">
                    <a-descriptions-item label="开始时间">
                        {{ showTask.status.startTime }}
                    </a-descriptions-item>
                    <a-descriptions-item label="当前网址">
                        {{ showTask.status.url }}
                    </a-descriptions-item>
                    <a-descriptions-item label="当前视频任务点">
                        {{ showTask.status.videos }} 个
                    </a-descriptions-item>
                    <a-descriptions-item label="当前答题任务点">
                        {{ showTask.status.qa }} 个
                    </a-descriptions-item>
                </template>
                <a-descriptions-item label="任务编号">
                    {{ showTask.name }}
                </a-descriptions-item>
            </a-descriptions>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { tasks } from "./task";
import Card from "@/components/common/Card.vue";
import { ref } from "@vue/reactivity";

// 当前 hover 的卡片组件
const hoverId = ref("");

// 详情框
const visible = ref(false);

// 展示详情的临时task变量
const showTask = ref<any | undefined>(undefined);

function showDetail(task: any) {
    showTask.value = task;
    visible.value = true;
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
</style>
