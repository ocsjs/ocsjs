<template>
    <a-form :model="tempUser" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
        <a-form-item label="名字/备注">
            <a-input v-model:value="tempUser.name" />
        </a-form-item>

        <a-form-item label="登录类型">
            <a-select v-model:value="tempUser.loginInfo.type">
                <a-select-option :value="1">超星账号登录</a-select-option>
                <a-select-option :value="2">超星手机号码登录</a-select-option>
                <a-select-option :value="3">超星机构登录</a-select-option>
                <a-select-option :value="4">超星手动登录</a-select-option>
                <a-select-option :value="5">智慧树手机号登录</a-select-option>
                <a-select-option :value="6">智慧树学号登录</a-select-option>
                <a-select-option :value="7">智慧树手动登录</a-select-option>
            </a-select>
        </a-form-item>
        <template v-if="tempUser.loginInfo.type === 1">
            <a-form-item label="账号">
                <a-input v-model:value="tempUser.loginInfo.phone" />
            </a-form-item>
            <a-form-item label="密码">
                <a-input v-model:value="tempUser.loginInfo.password" />
            </a-form-item>
        </template>
        <template v-else-if="tempUser.loginInfo.type === 2">
            <a-form-item label="手机号">
                <a-input v-model:value="tempUser.loginInfo.phone" />
            </a-form-item>
        </template>
        <template v-else-if="tempUser.loginInfo.type === 3">
            <a-form-item label="学校/单位">
                <a-input v-model:value="tempUser.loginInfo.unitname" />
            </a-form-item>
            <a-form-item label="工号/学号">
                <a-input v-model:value="tempUser.loginInfo.uname" />
            </a-form-item>
            <a-form-item label="密码">
                <a-input v-model:value="tempUser.loginInfo.password" />
            </a-form-item>
        </template>
        <template v-else-if="tempUser.loginInfo.type === 4"> </template>
        <template v-else-if="tempUser.loginInfo.type === 5">
            <a-form-item label="手机号">
                <a-input v-model:value="tempUser.loginInfo.phone" />
            </a-form-item>
            <a-form-item label="密码">
                <a-input v-model:value="tempUser.loginInfo.password" />
            </a-form-item>
        </template>
        <template v-else-if="tempUser.loginInfo.type === 6">
            <a-form-item label="学校名">
                <a-input v-model:value="tempUser.loginInfo.school" />
            </a-form-item>
            <a-form-item label="学号">
                <a-input v-model:value="tempUser.loginInfo.studentId" />
            </a-form-item>
            <a-form-item label="密码">
                <a-input v-model:value="tempUser.loginInfo.password" />
            </a-form-item>
        </template>
        <template v-else-if="tempUser.loginInfo.type === 7"> </template>
        <template v-else> 暂无这种登录方式 </template>
        <a-form-item :wrapper-col="{ span: 4, offset: 16 }">
            <a-button type="primary" @click="emits('ok', tempUser)">{{
                btnText
            }}</a-button>
        </a-form-item>
    </a-form>
</template>

<script setup lang="ts">
import { reactive, toRefs } from "@vue/reactivity";
import { User } from "app/types";
const uuid = require("uuid");

const props = defineProps<{
    btnText: string;
    user?: User;
}>();
const { btnText, user } = toRefs(props);

const emits = defineEmits<{
    (e: "ok", value: User): void;
}>();

const tempUser = reactive<User>(user?.value || createUser());

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
</script>

<style scope lang="less"></style>
