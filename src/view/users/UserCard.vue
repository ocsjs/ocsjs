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
            :footer="null"
            :destroyOnClose="true"
        >
            <UserForm @ok="ok" btnText="修改" :user="user" mode="modify"></UserForm>
        </a-modal>
    </a-card>
</template>

<script setup lang="ts">
import { toRefs } from "@vue/reactivity";
import { User } from "app/types";
import { ref } from "vue";
import UserForm from "./UserForm.vue";


const props = defineProps<{
    user: User;
}>();
const { user } = toRefs(props);

const visible = ref(false);

const emits = defineEmits<{
    (e: "delete", user: User): void;
    (e: "modify", user: User): void;
}>();

function ok() {
    visible.value = false;
    emits("modify", user.value);
}

function modify() {
    visible.value = true;
}

function start() {
    const core = require("puppeteer-core");

    console.log(
        "core",
        core.launch({
            // your chrome path
            executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            defaultViewport: null,
            headless: false,
        })
    );
    // const u = user.value;
    // const script = typeToPlatform(u.loginInfo?.type || -1);

    // if (script) {
    //     const id =
    //         script + u.loginInfo?.type ? "-" + u.loginInfo?.type : "" + "-" + u.uid;
    //     if (tasks.find((t) => t.name === id)) {
    //         message.warn("该账号已经启动!");
    //     } else {
    //         const task: Task = {
    //             name: id,
    //             script,
    //             user: toRaw(u),
    //             ocrOptions: toRaw(setting.script.account.ocr),
    //             pasue: false,
    //         };
    //         tasks.push(task);
    //         console.log(toRaw(task));

    //         ipcRenderer.send(IPCEventTypes.SCRIPT_LOGIN, toRaw(task));
    //         message.success("已添加至任务列表!");
    //     }
    // } else {
    //     message.error("任务启动失败, 未知的登录类型");
    // }
}
</script>

<style scope lang="less"></style>
