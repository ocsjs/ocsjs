<template>
    <div style="text-align: center; padding: 50px">
        <a-empty v-if="users.length === 0" description="">
            <a-button type="primary" shape="round" @click="addUser">
                添加账号
                <template #icon><PlusOutlined /></template>
            </a-button>
        </a-empty>
        <div v-else class="flex wrap">
            <UserCard v-for="user of users" :user-info="user" />
            <div
                style="width: 210px; height: 100px"
                class="flex ac-center ai-center jc-center add-card"
            >
                <a-button type="primary" shape="circle" @click="addUser">
                    <template #icon><PlusOutlined /></template>
                </a-button>
            </div>
        </div>

        <a-modal
            v-model:visible="visible"
            title="添加用户"
            @ok="handleOk"
            cancelText="取消"
            okText="添加"
        >
            <a-form
                :model="userTemp"
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 14 }"
            >
                <a-form-item label="名字">
                    <a-input v-model:value="userTemp.name" />
                </a-form-item>
                <a-form-item label="登录类型">
                    <a-select v-model:value="userTemp.loginInfo.type">
                        <a-select-option :value="1">超星账号登录</a-select-option>
                        <a-select-option :value="2">超星手机号码登录</a-select-option>
                        <a-select-option :value="3">超星机构登录</a-select-option>
                        <a-select-option :value="4">超星手动登录</a-select-option>
                        <a-select-option :value="5">智慧树手机号登录</a-select-option>
                        <a-select-option :value="6">智慧树学号登录</a-select-option>
                        <a-select-option :value="7">智慧树手动登录</a-select-option>
                    </a-select>
                </a-form-item>
                <template v-if="userTemp.loginInfo.type === 1">
                    <a-form-item label="账号">
                        <a-input v-model:value="userTemp.loginInfo.phone" />
                    </a-form-item>
                    <a-form-item label="密码">
                        <a-input v-model:value="userTemp.loginInfo.password" />
                    </a-form-item>
                </template>
                <template v-else-if="userTemp.loginInfo.type === 2">
                    <a-form-item label="手机号">
                        <a-input v-model:value="userTemp.loginInfo.phone" />
                    </a-form-item>
                </template>
                <template v-else-if="userTemp.loginInfo.type === 3">
                    <a-form-item label="学校/单位">
                        <a-input v-model:value="userTemp.loginInfo.unitname" />
                    </a-form-item>
                    <a-form-item label="工号/学号">
                        <a-input v-model:value="userTemp.loginInfo.uname" />
                    </a-form-item>
                    <a-form-item label="密码">
                        <a-input v-model:value="userTemp.loginInfo.password" />
                    </a-form-item>
                </template>
                <template v-else-if="userTemp.loginInfo.type === 4"> </template>
                <template v-else-if="userTemp.loginInfo.type === 5">
                    <a-form-item label="手机号">
                        <a-input v-model:value="userTemp.loginInfo.phone" />
                    </a-form-item>
                    <a-form-item label="密码">
                        <a-input v-model:value="userTemp.loginInfo.password" />
                    </a-form-item>
                </template>
                <template v-else-if="userTemp.loginInfo.type === 6">
                    <a-form-item label="学校名">
                        <a-input v-model:value="userTemp.loginInfo.school" />
                    </a-form-item>
                    <a-form-item label="学号">
                        <a-input v-model:value="userTemp.loginInfo.studentId" />
                    </a-form-item>
                    <a-form-item label="密码">
                        <a-input v-model:value="userTemp.loginInfo.password" />
                    </a-form-item>
                </template>
                <template v-else-if="userTemp.loginInfo.type === 7"> </template>
                <template v-else> 暂无这种登录方式 </template>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { store } from "@/utils/store";
import { reactive, ref, toRaw } from "@vue/reactivity";
import { watch } from "@vue/runtime-core";
import { message } from "ant-design-vue";
import { User } from "app/types";
import UserCard from "./UserCard.vue";
const uuid = require("uuid");

const us = store.get("users");
if (!us) {
    store.set("users", []);
}

const users = reactive<User[]>(us || []);

let userTemp = reactive<User>(createUser());

// 用户模板
function createUser(): User {
    return {
        uid: uuid.v4().replace(/-/g, ""),
        name: "",
        loginTime: 0,
        delete: false,
        updateTime: Date.now(),
        createTime: Date.now(),
        loginInfo: {
            type: 1,
            phone: "",
            password: "",
        },
    };
}

const visible = ref<boolean>(false);

const handleOk = (e: MouseEvent) => {
    visible.value = false;
    users.push(toRaw(userTemp));
    console.log("userTemp", userTemp);
    message.success("创建成功!");
};
function addUser() {
    Object.assign(userTemp, createUser());
    visible.value = true;
}

watch(users, () => {
    store.set("users", toRaw(users));
});
</script>

<style scope lang="less">
.add-card {
    margin: 8px;
    border-radius: 4px;
    border: dashed #ebebeb;
}
</style>
