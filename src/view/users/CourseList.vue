<template>
    <div>
        <template
            v-if="user.courses.filter((c) => c.platform === user.platform).length === 0"
        >
            <div style="text-align: center" v-if="!showOnly">
                <a-button type="primary" shape="round" @click="visible = !visible">
                    <PlusOutlined /> 手动添加
                </a-button>
            </div>
        </template>

        <template v-else>
            <a-list
                class="course-list"
                item-layout="horizontal"
                :data-source="user.courses.filter((c) => c.platform === user.platform)"
            >
                <template #renderItem="{ item }">
                    <a-list-item
                        @click="showOnly && courseClick(item)"
                        :class="
                            showOnly && selectItems.some((c) => c.id === item.id)
                                ? 'course-list-item selected'
                                : 'course-list-item'
                        "
                    >
                        <template v-if="!showOnly" #actions>
                            <a-button
                                type="primary"
                                shape="circle"
                                @click="
                                    (modifyVisible = !modifyVisible),
                                        (selectCourse = item)
                                "
                            >
                                <template #icon><EditOutlined /></template>
                            </a-button>
                            <a-button
                                type="primary"
                                shape="circle"
                                danger
                                @click="deleteCourse(item.id)"
                            >
                                <template #icon><DeleteOutlined /></template>
                            </a-button>
                        </template>

                        <a-list-item-meta :description="detail ? item.profile : ''">
                            <template #title>
                                <a class="space-10">
                                    <span class="font-v2">{{ item.name }}</span>
                                </a>
                            </template>
                            <template v-if="showImg" #avatar>
                                <a-avatar
                                    :src="item.img"
                                    shape="square"
                                    :style="{
                                        width: '86px',
                                        height: '100%',
                                        marginLeft: '20px',
                                    }"
                                />
                            </template>
                        </a-list-item-meta>
                    </a-list-item>
                </template>
            </a-list>

            <div style="text-align: center" v-if="!showOnly">
                <a-button
                    class="margin-top-24"
                    type="primary"
                    shape="round"
                    @click="visible = !visible"
                >
                    <PlusOutlined /> 手动添加
                </a-button>
            </div>
        </template>

        <CourseForm
            v-model:visible="visible"
            v-model:course="tempCourse"
            @ok="addCourse"
        />

        <CourseForm
            v-model:visible="modifyVisible"
            v-model:course="selectCourse"
            @ok="modifyCourse"
        />
    </div>
</template>

<script setup lang="ts">
import { config } from "@/utils/store";
import { reactive, ref, toRefs } from "@vue/reactivity";
import { message } from "ant-design-vue";
import { User } from "app/types";
import { Course } from "app/types/script/course";
const { randomUUID } = require("crypto");
import CourseForm from "./CourseForm.vue";

const props = defineProps<{
    user: User;
    detail?: boolean;
    showImg?: boolean;
    // 只展示列表，不显示其他组件
    showOnly?: boolean;
}>();

const { user, detail, showImg, showOnly } = toRefs(props);

const emits = defineEmits<{
    (e: "update", courses: Course[]): void;
}>();

// 选中的课程 id
const selectItems = ref<Course[]>([]);

// 选择的课程
const selectCourse = ref();

// 临时新建
const tempCourse = reactive<Course>({
    id: randomUUID().toString().replace(/-/g, ""),
    uid: user.value.uid,
    name: "新建课程",
    profile: "新建课程的备注",
    platform: user.value.platform,
    url: "",
    img: "app://./favicon.png",
});

const visible = ref(false);
const modifyVisible = ref(false);

function courseClick(item: Course) {
    if (selectItems.value.length >= config.setting.common.task.maxTasks) {
        message.warn(
            "请不要超出最大任务数量: " +
                config.setting.common.task.maxTasks +
                " ，可以到通用设置里配置!"
        );
    } else {
        // 如果已经存在，则删除，否则添加
        if (selectItems.value.some((c) => c.id === item.id)) {
            selectItems.value = selectItems.value.filter((i) => i.id !== item.id);
        } else {
            selectItems.value.push(item);
        }
        update();
    }
}

function update() {
    emits("update", selectItems.value);
}

function addCourse() {
    // 刷新 id
    (tempCourse.id = randomUUID().toString().replace(/-/g, "")),
        user.value.courses.push(JSON.parse(JSON.stringify(tempCourse)));
    visible.value = false;
}

function modifyCourse(item: Course) {
    modifyVisible.value = false;
}

function deleteCourse(id: string) {
    user.value.courses = user.value.courses.filter((c) => c.id !== id);
}
</script>

<style scope lang="less">
@import "@/assets/less/ant.less";

.course-list-item {
    padding: 12px;
    margin: 12px;
    border-radius: 4px;
    &:hover {
        box-shadow: 0px 0px 4px #dcdcdc;
        cursor: pointer;
    }

    &.selected {
        box-shadow: 0px 0px 6px fade(@primary-color, 60%);
    }
}
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
