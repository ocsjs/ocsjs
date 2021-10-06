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
            <a-popover content="删除"><DeleteOutlined /></a-popover>
            <a-popover content="修改"><EditOutlined /></a-popover>
            <a-popover content="详情"><EllipsisOutlined /></a-popover>
          
        </template>
        <a-card-meta :title="userInfo.name">
            <template #avatar>
                <a-avatar>
                    <template #icon>
                        <UserOutlined />
                    </template>
                </a-avatar>
            </template>
        </a-card-meta>
    </a-card>
</template>

<script setup lang="ts">
import { toRefs } from "@vue/reactivity";
import { User } from "app/types";

const props = defineProps<{
    userInfo: User;
}>();
const { userInfo } = toRefs(props);
</script>

<style scope lang="less"></style>
