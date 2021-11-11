<template>
    <div>
        <item description="必须配置查题码才能使用`自动答题`" label="查题码" md font-bold>
            <a-input
                type="text"
                size="small"
                style="width: 300px"
                v-model:value="account.queryToken"
                @change="debouncedClick"
            />
        </item>

        <template v-if="CheckLoading">
            <item label="提示">
                <span>正在加载查题信息 <LoadingOutlined /></span>
            </item>
        </template>
        <template v-else-if="TokenInfo.msg">
            <item label="提示">
                <a-alert
                    show-icon
                    :message="TokenInfo.msg"
                    type="error"
                    style="height: 24px"
                />
            </item>
        </template>

        <item :text="TokenInfo.query_times || '无'" label="剩余次数" />
        <item :text="TokenInfo.success_times || '无'" label="成功次数" />
        <item :text="TokenInfo.all_times || '无'" label="总查询次数" />
    </div>
</template>

<script setup lang="ts">
import { TokenInfo, CheckLoading, checkToken, config } from "@/utils/store";
import { debounce } from "lodash";
import { onUnmounted } from "vue";
const account = config.setting.script.account;
// loadsh 防抖
const debouncedClick = debounce(() => checkToken(account.queryToken), 500);
onUnmounted(() => {
    // 移除组件时，取消定时器
    debouncedClick.cancel();
});
</script>

<style scope lang="less"></style>
