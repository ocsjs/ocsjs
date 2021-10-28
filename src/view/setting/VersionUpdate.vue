<template>
    <div>
        <setting-card title="版本列表" color="blue">
            <a-empty
                :image="simpleImg"
                v-if="updateInfo.tags.length === 0 && updateInfo.versions.length === 0"
                :description="desc"
            ></a-empty>
            <template v-else>
                <setting-card title="标签分类" size="small">
                    <setting>
                        <a-empty
                            :style="{ margin: '4px 0' }"
                            :image="simpleImg"
                            v-if="updateInfo.tags.length === 0"
                            description="暂无数据"
                        ></a-empty>
                        <a-tag v-for="(item, index) in reflect.ownKeys(updateInfo.tags)" :key="index">
                            {{ item }}@{{updateInfo.tags[(item as any)]}}
                        </a-tag>
                    </setting>
                </setting-card>
                <setting-card title="版本分类" size="small">
                    <setting>
                        <a-empty
                            :image="simpleImg"
                            v-if="updateInfo.versions.length === 0"
                            description="暂无数据"
                        ></a-empty>
                        <a-tag v-for="(item, index) in updateInfo.versions" :key="index">
                            {{ item }}
                        </a-tag>
                    </setting>
                </setting-card>
            </template>
        </setting-card>
        <setting-card title="更新设置" color="blue">
            <setting label="当前版本" font-bold>
                <span class="space-10 flex">
                    <span>{{ Remote.app.call("getVersion") }} </span>

                    <LoadingOutlined v-if="needUpdate === -1" />
                    <div v-else-if="needUpdate === 1">
                        <a-tag color="#f50">需要更新</a-tag>
                    </div>
                    <div v-else>
                        <a-tag color="#87d068">已经是最新版本</a-tag>
                    </div>
                </span>
            </setting>
            <setting font-bold label="上次检测时间">
                {{ new Date(update.lastTime).toLocaleString() }}
            </setting>
            <setting font-bold label="自动更新">
                <a-switch v-model:checked="update.autoUpdate" />
            </setting>
            <setting font-bold label="自动更新间隔">
                <div class="space-10">
                    <a-input-number
                        size="small"
                        :min="1"
                        :max="24"
                        :default-value="1"
                        v-model:value="update.hour"
                        :disabled="!update.autoUpdate"
                    />
                    <span>小时</span>
                </div>
            </setting>
            <setting font-bold label="操作">
                <div class="space-10">
                    <a-button type="primary" @click="checkUpdate" size="small"
                        >更新检测</a-button
                    >
                    <a-button type="primary" @click="onUpdate" size="small">
                        更新
                    </a-button>
                </div>
            </setting>
        </setting-card>
    </div>
</template>

<script setup lang="ts">
import { Remote } from "@/utils/remote";

import { nextTick, onMounted, reactive, ref } from "vue";

import { message } from "ant-design-vue";
import { setting } from "./setting";
import { IPCEventTypes } from "app/types";
import { AxiosGet, NetWorkCheck } from "@/utils/request";
import SettingCard from "@/components/common/SettingCard.vue";
import Setting from "@/components/common/Setting.vue";
import { Empty } from "ant-design-vue";
const reflect = Reflect



const simpleImg = Empty.PRESENTED_IMAGE_SIMPLE;
const { update } = setting;
const { ipcRenderer } = require("electron");
// 描述
const desc = ref("");
// 版本号信息
const updateInfo = reactive<{ tags: any[]; versions: [] }>({
    tags: [],
    versions: [],
});
// 是否需要更新, -1 正在加载, 1 需要 , 0 不需要
const needUpdate = ref(-1);

async function listVersion() {
    desc.value = "正在获取版本列表";
    if (await NetWorkCheck()) {
        const { data: res } = await AxiosGet(
            "https://gitee.com/api/v5/repos/enncy/online-course-script/tags"
        );
        desc.value = "获取成功";
        Object.assign(updateInfo, res);
        console.log(res);
    } else {
        desc.value = "网络错误，获取失败";
    }
}

async function checkUpdate() {
    if (await NetWorkCheck()) {
        needUpdate.value = -1;
        ipcRenderer.send(IPCEventTypes.IS_NEED_UPDATE);
        ipcRenderer.on(IPCEventTypes.IS_NEED_UPDATE, (e, v) => {
            needUpdate.value = v ? 1 : 0;

            if (needUpdate.value === 1) {
                message.warn("需要更新");
            } else {
                message.success("已经是最新版本");
            }
        });
    }
}

async function onUpdate() {
    if (await NetWorkCheck()) {
        ipcRenderer.send(IPCEventTypes.APP_UPDATE);
    }
}
onMounted(async () => {
    await listVersion();
    await checkUpdate();
});
</script>

<style scope lang="less"></style>
