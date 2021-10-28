<template>
    <div>
        <setting-card title="版本列表" color="blue" close-collapse>
            <transition name="fade" mode="out-in">
                <keep-alive>
                    <template v-if="loading">
                        <a-skeleton />
                    </template>
                    <a-empty
                        :image="simpleImg"
                        v-else-if="updateTags.length === 0"
                        :description="desc"
                    ></a-empty>

                    <template
                        v-else
                        v-for="(item, index) in updateTags.reverse().slice(0, tagSize)"
                        :key="index"
                    >
                        <div @mouseenter="mouseEnter(index)" @mouseleave="mouseLeave">
                            <item>
                                <template #label>
                                    <a-tag><TagFilled />{{ item.name }}</a-tag>
                                </template>
                                <transition name="fade" mode="out-in" :duration="100">
                                    <span v-if="currentItem === index">
                                        <a-button
                                            type="link"
                                            size="small"
                                            style="line-height: 10px; height: 10px"
                                            @click="()=>{
                                                gitee.update(item)
                                            }"
                                            >切换到此版本</a-button
                                        >
                                    </span>
                                    <span v-else> - {{ showFomatSize(item.size) }} </span>
                                </transition>
                            </item>
                            <transition name="collapse">
                                <setting-card
                                    v-show="currentItem === index"
                                    close-collapse
                                    size="small"
                                    style="text-align: left; height: 84px"
                                >
                                    <item font-bold label="描述">
                                        {{ item.message || "无" }}
                                    </item>
                                    <item font-bold v-if="item.size" label="大小">
                                        {{ showFomatSize(item.size) }}
                                    </item>
                                    <item font-bold v-if="item.resourse" label="源码">
                                        <a :href="item.resourse">{{ item.resourse }}</a>
                                    </item>
                                </setting-card>
                            </transition>
                        </div>
                    </template>
                </keep-alive>
            </transition>
        </setting-card>
        <setting-card title="更新设置" color="blue">
            <item label="当前版本" font-bold>
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
            </item>
            <item font-bold label="上次检测时间">
                {{ new Date(update.lastTime).toLocaleString() }}
            </item>
            <item font-bold label="自动更新">
                <a-switch v-model:checked="update.autoUpdate" />
            </item>
            <item font-bold label="自动更新间隔">
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
            </item>
            <item font-bold label="操作">
                <div class="space-10">
                    <a-button type="primary" :disabled="needUpdate === -1" @click="checkUpdate" size="small"
                        >更新检测</a-button
                    >
                    <a-button type="primary" @click="onUpdate" size="small">
                        更新
                    </a-button>
                </div>
            </item>
        </setting-card>
    </div>
</template>

<script setup lang="ts">
import { Remote } from "@/utils/remote";

import { onMounted, ref } from "vue";
import { message } from "ant-design-vue";
import { setting } from "./setting";
import { IPCEventTypes } from "app/types";
import { NetWorkCheck } from "@/utils/request";
import SettingCard from "@/components/common/SettingCard.vue";
import item from "@/components/common/item.vue";
import { Empty } from "ant-design-vue";
import { Gitee, showFomatSize, Tag } from "./updater";

import { debounce } from "lodash";

const simpleImg = Empty.PRESENTED_IMAGE_SIMPLE;
const { update } = setting;
const { ipcRenderer } = require("electron");

// 版本列表展示的当前值
const currentItem = ref(0);
// 需要展示的标签数量
const tagSize = ref(3);

// 描述
const desc = ref("");
// 版本号信息
const updateTags = ref<Tag[]>([]);
// 是否需要更新, -1 正在加载, 1 需要 , 0 不需要
const needUpdate = ref(-1);
// 更新程序
const gitee = new Gitee();
// 正在加载
const loading = ref(false);
async function listVersion() {
    loading.value = true;
    desc.value = "正在获取版本列表";
    if (await NetWorkCheck()) {
        const tags = await gitee.listTags();

        if (tags.length === 0) {
            desc.value = "暂无版本";
        } else {
            updateTags.value = tags;
        }

        console.log("tags", tags);
    } else {
        desc.value = "网络错误，获取失败";
    }
    loading.value = false;
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

function mouseEnter(index: number) {
    currentItem.value = index;
}
function mouseLeave() {
    currentItem.value = -1;
}
onMounted(async () => {
    await listVersion();
    await checkUpdate();
});
</script>

<style scope lang="less">
// 折叠加隐藏过渡效果
.collapse-enter-active,
.collapse-leave-active {
    transition: all 0.1s;
    overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
    padding: 0px !important;
    height: 0px !important;
    opacity: 0;
}
</style>
