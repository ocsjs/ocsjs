<template>
    <div style="text-align: center; padding: 0px 50px; height: 100%">
        <div
            v-if="users.length === 0"
            style="width: 100%; height: 100%"
            class="flex jc-center ac-center ai-center"
        >
            <a-empty description="">
                <a-button type="primary" shape="round" @click="initUser">
                    添加账号
                    <template #icon><PlusOutlined /></template>
                </a-button>
            </a-empty>
        </div>

        <template v-else>
            <div style="margin: 18px auto; width: 420px">
                <a-input-search
                    v-model:value="search"
                    placeholder="输入名字，或者其他信息片段"
                    enter-button
                    style="border-radius: 12px"
                >
                </a-input-search>
            </div>

            <div class="flex wrap">
                <UserCard
                    v-for="user of filter(users)"
                    :user="user"
                    @delete="onDeleteUser"
                    @modify="onModifyUser"
                />
                <div
                    style="width: 260px; height: 100px"
                    class="flex ac-center ai-center jc-center add-card"
                >
                    <a-button type="primary" shape="circle" @click="initUser">
                        <template #icon><PlusOutlined /></template>
                    </a-button>
                </div>
            </div>
        </template>

        <a-modal
            v-model:visible="visible"
            title="添加用户"
            :width="740"
            :style="{ top: '42px' }"
            :footer="null"
            :destroyOnClose="true"
        >
            <UserForm @ok="onAddUser" btnText="添加" mode="create"></UserForm>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { config } from "@/utils/store";
import { ref } from "@vue/reactivity";

import { message } from "ant-design-vue";
import { User } from "app/types";
import UserCard from "./UserCard.vue";
import UserForm from "./UserForm.vue";
 

const users: User[] = config.users;

// 是否显示添加框
const visible = ref<boolean>(false);

// 搜索值
const search = ref("");

// 增加
const onAddUser = (user: User) => {
    visible.value = false;
    users.push(user);
    console.log("add-user", user);
    message.success("创建成功!");
};

// 查询用户
function filter(users: User[]) {
    const res = users.filter((u) => {
        if (u.name.indexOf(search.value) !== -1) {
            return u;
        }
        for (const key in u.loginInfo) {
            if ((u.loginInfo as any)[key].toString().indexOf(search.value) !== -1) {
                return u;
            }
        }
    });

    return res;
}

// 删除
function onDeleteUser(user: User) {
    users.splice(
        users.findIndex((u) => u.uid === user.uid),
        1
    );
}

// 修改
function onModifyUser(user: User) {
    Object.assign(
        users,
        users.map((u) => (u.uid === user.uid ? user : u))
    );
}

function initUser() {
    visible.value = true;
}
</script>

<style scope lang="less">
.add-card {
    margin: 8px;
    border-radius: 4px;
    border: dashed #ebebeb;
}
</style>
