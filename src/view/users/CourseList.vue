<template>
    <div>
        <div
            v-if="!showOnly"
            class="space-10 margin-left-10 padding-right-10 margin-bottom-10 flex nowrap"
        >
            <span style="white-space: nowrap">
                已选课程:{{ selectItems.length !== 0 ? "" : "暂无" }}
            </span>
            <span
                v-if="selectItems.length !== 0"
                class="flex nowrap"
                style="overflow-x: auto"
            >
                <transition-group name="fade">
                    <a-tag
                        class="margin-top-2"
                        color="#2db7f5"
                        v-for="item of selectItems"
                        closable
                        @close="removeSelectedCourse(item)"
                        :key="item.id"
                    >
                        {{ item.profile.replace(/\n+/, "-").split("-")[0] }}
                    </a-tag>
                </transition-group>
            </span>
        </div>
        <!-- 展示指定平台的课程列表 -->
        <a-empty
            v-if="user.courses.filter((c) => c.platform === user.platform).length === 0"
            description="此平台暂无课程，请点击下方按钮获取"
        >
        </a-empty>
        <a-list
            v-else
            class="course-list"
            style="overflow: auto"
            item-layout="horizontal"
            :data-source="user.courses.filter((c) => c.platform === user.platform)"
        >
            <template #renderItem="{ item }">
                <a-list-item
                    @click="courseClick(item)"
                    :class="
                        !showOnly && selectItems.some((c) => c.id === item.id)
                            ? 'course-list-item selected'
                            : 'course-list-item'
                    "
                >
                    <a-list-item-meta
                        :description="
                            detail
                                ? String(item.profile)
                                      .replace(/\n+/, '-')
                                      .split('-')
                                      .splice(1)
                                      .join(' ')
                                : ''
                        "
                    >
                        <template #title>
                            <a class="space-10">
                                <span class="font-v2">{{
                                    String(item.profile).replace(/\n+/, "-").split("-")[0]
                                }}</span>
                            </a>
                        </template>
                        <template v-if="showImg" #avatar>
                            <a-avatar
                                :src="item.img"
                                shape="square"
                                :style="{ width: '86px', height: '100%' }"
                            />
                        </template>
                    </a-list-item-meta>
                </a-list-item>
            </template>
        </a-list>
        <div v-if="!showOnly" class="padding-top-24 margin-right-10-10 flex jc-flex-end">
            <a-button type="primary" @click="start">开始刷课</a-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { config } from "@/utils/store";
import { ref, toRefs } from "@vue/reactivity";
import { message } from "ant-design-vue";
import { User } from "app/types";
import { Course } from "app/types/script/course";

const props = defineProps<{
    user: User;
    detail?: boolean;
    showImg?: boolean;
    // 只展示列表，不显示其他组件
    showOnly?: boolean;
}>();

const { user, detail, showImg, showOnly } = toRefs(props);

// 选中的课程 id
const selectItems = ref<Course[]>([]);
function courseClick(item: Course) {
    // 如果已经存在，则删除，否则添加
    if (selectItems.value.some((c) => c.id === item.id)) {
        removeSelectedCourse(item);
    } else {
        selectItems.value.push(item);
    }
}

function removeSelectedCourse(item: Course) {
    selectItems.value = selectItems.value.filter((i) => i.id !== item.id);
}

function start() {
    if (selectItems.value.length > config.setting.common.task.maxTasks) {
        message.warn(
            "请不要超出最大任务数量(" +
                config.setting.common.task.maxTasks +
                ") 当前 " +
                selectItems.value.length +
                "，如需修改请到通用设置里配置!"
        );
    } else {
        console.log(selectItems.value);
    }
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
