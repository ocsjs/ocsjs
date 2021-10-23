<template>
    <div>
        <a-list
            class="course-list"
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
                                :style="{ width: '86px', height: '100%' }"
                            />
                        </template>
                    </a-list-item-meta>
                </a-list-item>
            </template>
        </a-list>
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

const emits = defineEmits<{
    (e: "update", courses: Course[]): void;
}>();

// 选中的课程 id
const selectItems = ref<Course[]>([]);
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
