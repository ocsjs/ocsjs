<template>
    <a-card
        hoverable
        style="width: 260px; margin: 8px"
        :bodyStyle="{
            padding: '12px',
            display: 'flex',
            alignItems: 'baseline',
        }"
    >
        <template class="ant-card-actions" #actions>
            <a-popover content="删除">
                <a-popconfirm
                    title="你确定要删除这个账号吗"
                    ok-text="确定"
                    cancel-text="取消"
                    @confirm="emits('delete', user)"
                >
                    <DeleteOutlined />
                </a-popconfirm>
            </a-popover>
            <a-popover content="修改"><EditOutlined @click="modify" /></a-popover>
            <a-popover content="启动"><PlayCircleOutlined @click="showList" /></a-popover>
        </template>
        <a-card-meta>
            <template #title>
                <a-popover title="详情信息">
                    <template #content>
                        <div class="font-v3" style="white-space: nowrap; overflow: auto">
                            <div><span class="font-v2">备注</span> : {{ user.name }}</div>
                            <div><span class="font-v2">uid</span> : {{ user.uid }}</div>
                            <div>
                                <span class="font-v2">创建时间</span> :
                                {{ new Date(user.createTime).toLocaleString() }}
                            </div>
                            <div>
                                <span class="font-v2">更新时间</span> :
                                {{ new Date(user.updateTime).toLocaleString() }}
                            </div>
                            <div>
                                <span class="font-v2">最近登录</span> :
                                {{
                                    user.loginTime
                                        ? new Date(user.loginTime).toLocaleString()
                                        : "无"
                                }}
                            </div>
                            <div>
                                <span class="font-v2">课程数</span> : 共有
                                {{
                                    user.courses.filter(
                                        (c) => c.platform === user.platform
                                    ).length
                                }}
                                门课程
                            </div>
                        </div>
                    </template>
                    <div class="user-info">
                        <div class="flex ai-baseline space-10">
                            <span>{{ user.name }}</span>
                            <span class="font-v4">
                                {{ AllScriptAlias[user.loginScript] }}
                            </span>
                        </div>
                    </div>
                </a-popover>
            </template>
            <template #avatar>
                <a-avatar>
                    <template #icon>
                        <UserOutlined />
                    </template>
                </a-avatar>
            </template>
        </a-card-meta>

        <a-modal
            v-model:visible="visible"
            title="修改用户"
            :footer="null"
            :destroyOnClose="true"
            width="90%"
            wrapClassName="full-modal"
        >
            <UserForm @ok="ok" btnText="修改" :user="user" mode="modify"></UserForm>
        </a-modal>

        <a-modal
            v-model:visible="startShow"
            title="选择启动课程"
            :width="740"
            :style="{ top: '42px' }"
            :footer="null"
            :destroyOnClose="true"
        >
            <item
                font-bold
                label="登录方式"
                description="如需修改，请到账号管理中点击修改按钮进行信息修改！"
            >
                {{ AllScriptAlias[user.loginScript] }}
            </item>

            <div class="space-10 margin-bottom-10 flex nowrap">
                <span style="white-space: nowrap; font-weight: bold">
                    已选课程 : {{ selectItems.length !== 0 ? "" : "暂无" }}
                </span>
                <span
                    v-if="selectItems.length !== 0"
                    class="flex nowrap"
                    style="overflow: auto; padding: 2px"
                >
                    <a-tag
                        class="margin-top-2"
                        color="#2db7f5"
                        v-for="item of selectItems.filter(
                            (c) => c.platform === user.platform
                        )"
                        :key="item.id"
                    >
                        {{ item.name }}
                    </a-tag>
                </span>
            </div>
            <!-- 展示指定平台的课程列表 -->
            <a-empty
                v-if="
                    user.courses.filter((c) => c.platform === user.platform).length === 0
                "
                description="此平台暂无课程，请点击下方按钮获取"
            >
            </a-empty>
            <div v-else style="max-height: 340px; overflow: auto">
                <CourseList
                    :user="user"
                    detail
                    show-img
                    @update="update"
                    :show-only="true"
                />
            </div>
            <div class="padding-top-24 flex jc-flex-end">
                <a-button
                    class="margin-right-24"
                    type="primary"
                    @click="start"
                    :disabled="starting"
                    >开始刷课</a-button
                >
            </div>
        </a-modal>
    </a-card>
</template>

<script setup lang="ts">
import { reactive, toRaw, toRefs } from "@vue/reactivity";
import { message } from "ant-design-vue";
import { AllScriptAlias, BaseTask, PlatformAlias, User } from "app/types";
import { ref } from "vue";
import UserForm from "./UserForm.vue";
import CourseList from "./CourseList.vue";
import { Remote } from "@/utils/remote";
import { Course } from "app/types/script/course";
import { AddCourseTask } from "../task/task";
import { useRouter } from "vue-router";
import { NetWorkCheck } from "@/utils/request";
import { Task } from "app/electron/task";
import Item from "@/components/common/item.vue";

const router = useRouter();
const props = defineProps<{
    user: User;
}>();
const { user } = toRefs(props);

// 修改框显示
const visible = ref(false);
// 启动显示
const startShow = ref(false);

// 是否启动中
const starting = ref(false);

const emits = defineEmits<{
    (e: "delete", user: User): void;
    (e: "modify", user: User): void;
}>();

// 选中的课程
const selectItems = ref<Course[]>([]);

function ok() {
    visible.value = false;
    message.success("修改成功！");
    emits("modify", user.value);
}

function modify() {
    visible.value = true;
}

function update(courses: Course[]) {
    selectItems.value = courses;
}

function showList() {
    startShow.value = true;
}

async function start() {
    starting.value = true;
    if (await NetWorkCheck()) {
        for (const course of selectItems.value.filter(
            (c) => c.platform === user.value.platform
        )) {
            const task: Task = reactive(
                Remote.script.call(
                    "start",
                    user.value.loginScript,
                    toRaw(user.value),
                    toRaw(course)
                )
            );

            AddCourseTask({
                target: task,
                course,
                user: user.value,
            });
            message.success(course.name + " 启动成功！");
        }
        setTimeout(() => {
            starting.value = false;
            startShow.value = false;
            router.push("/task");
        }, 500);
    } else {
        starting.value = false;
        startShow.value = false;
    }
}
</script>

<style scope lang="less">
// 隐藏过渡效果
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
