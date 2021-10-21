<template>
    <a-card
        hoverable
        style="width: 210px; margin: 8px"
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
            <a-popover content="启动"><PlayCircleOutlined @click="start" /></a-popover>
        </template>
        <a-card-meta>
            <template #title>
                <span class="user-info">
                    {{ user.name }}
                    <span class="font-v4">
                        {{ (user.loginInfo as any).phone || (user.loginInfo as any).uname  ||  (user.loginInfo as any).studentId }}
                    </span>
                </span>
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
            :width="740"
            :style="{ top: '42px' }"
            :footer="null"
            :destroyOnClose="true"
        >
            <UserForm @ok="ok" btnText="修改" :user="user" mode="modify"></UserForm>
        </a-modal>

        <a-modal
            v-model:visible="starting"
            title="选择启动课程"
            :width="740"
            :style="{ top: '42px' }"
            :footer="null"
            :destroyOnClose="true"
        >
              
                 <CourseList :user="user" detail show-img/>
        </a-modal>
    </a-card>
</template>

<script setup lang="ts">
import { toRefs } from "@vue/reactivity";
import { message } from "ant-design-vue";
import { User } from "app/types";
import { ref } from "vue";
import UserForm from "./UserForm.vue";
import CourseList from "./CourseList.vue";

const props = defineProps<{
    user: User;
}>();
const { user } = toRefs(props);

// 修改框显示
const visible = ref(false);
// 是否启动
const starting = ref(false);
const emits = defineEmits<{
    (e: "delete", user: User): void;
    (e: "modify", user: User): void;
}>();

function ok() {
    visible.value = false;
    message.success("修改成功！");
    emits("modify", user.value);
}

function modify() {
    visible.value = true;
}

function start() {
    const u = user.value;
    starting.value = true
    console.log(u);
}
</script>

<style scope lang="less"></style>
