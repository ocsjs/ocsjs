<template>
    <div>
        <card class="tag-list" title="更新列表" :open-collapse="false">
            <template v-if="fetchingInfo">
                <a-skeleton active />
            </template>
            <template v-else-if="!updateInfos.latestInfo">
                <a-empty description="当前暂无版本" :image="simpleImg" />
            </template>

            <div v-else v-for="(item, index) in updateInfos.tags.slice(0, tagSize)">
                <div
                    class="padding-4"
                    @mouseenter="mouseEnter(index)"
                    @mouseleave="mouseLeave"
                >
                    <item>
                        <template #label>
                            <a-tag><TagFilled /> {{ item.name }}</a-tag>
                        </template>
                        <a-button
                            type="link"
                            size="small"
                            style="line-height: 10px; height: 10px"
                            @click="updateVersion(item)"
                        >
                            <div>查看版本信息</div>
                        </a-button>
                    </item>
                </div>
            </div>
        </card>
        <card title="手动更新">
            <a-upload-dragger
                v-model:fileList="fileList"
                name="update"
                :multiple="false"
                :customRequest="customRequest"
                :show-upload-list="false"
            >
                <p class="ant-upload-drag-icon">
                    <inbox-outlined></inbox-outlined>
                </p>
                <p class="ant-upload-text">拖到压缩安装包到此处</p>
                <p class="ant-upload-hint">
                    请在更新列表中手动下载您想要的版本，然后将您下载的压缩文件拖入上方的区域中
                </p>
            </a-upload-dragger>
        </card>

        <card title="更新设置">
            <item font-bold label="自动检测更新" description="每次启动软件自动检测更新">
                <a-switch
                    checked-children="开"
                    un-checked-children="关"
                    v-model:checked="updateInfos.autoUpdate"
                />
                <br />
            </item>
            <item
                font-bold
                label="更新服务器"
                md
                description="软件更新服务器<br>`腾讯云` : 腾讯云 对象存储 更新服务器<br>`JsDelivr`: 文件加速网站，偶尔会访问错误<br>`Gitee`: 码云，国内平台，存在更新限制（1-2次） "
            >
                <a-radio-group size="small" v-model:value="updateInfos.updateSource">
                    <a-radio-button :disabled="fetchingInfo" value="TencentCloud">
                        腾讯云 (默认)
                    </a-radio-button>
                    <a-radio-button :disabled="fetchingInfo" value="JsDelivr">
                        JsDelivr
                    </a-radio-button>
                    <a-radio-button :disabled="fetchingInfo" value="Gitee">
                        Gitee
                    </a-radio-button>
                </a-radio-group>
            </item>
        </card>

        <card title="当前版本信息">
            <item label="当前版本" font-bold>
                <span class="space-10 flex">
                    <span>{{ json.version }} </span>
                    <LoadingOutlined v-if="fetchingInfo" />
                    <div v-else-if="updateInfos.needUpdate">
                        <a-tag color="#f50">需要更新</a-tag>
                    </div>
                    <div v-else>
                        <a-tag color="#87d068">已经是最新版本</a-tag>
                    </div>
                </span>
            </item>

            <template v-if="updateInfos.currentLatestInfo">
                <item font-bold label="描述">
                    <a-popover title="详情">
                        <template #content>
                            <md-render
                                :content="
                                    updateInfos.currentLatestInfo.message.join('<br>')
                                "
                            ></md-render>
                        </template>
                        <span style="height: 22px">
                            {{ updateInfos.currentLatestInfo.message[0] }}
                            <span class="font-v4">{{
                                updateInfos.currentLatestInfo.message.length > 1
                                    ? "...更多"
                                    : ""
                            }}</span>
                        </span>
                    </a-popover>
                </item>
                <item font-bold label="大小">
                    {{ showFormatSize(updateInfos.currentLatestInfo.size) }}
                </item>
                <item font-bold label="发布日期">
                    {{ new Date(updateInfos.currentLatestInfo.date).toLocaleString() }}
                </item>
            </template>

            <template v-else>
                <item font-bold label="详情">
                    <span>版本信息获取失败，可能是远程文件丢失。</span>
                </item>
            </template>

            <item font-bold label="操作">
                <div class="space-10">
                    <a-button
                        type="primary"
                        :disabled="fetchingInfo"
                        @click="refreshUpdateInfo"
                        size="small"
                        >检测更新</a-button
                    >
                </div>
            </item>
        </card>

        <a-modal
            title="版本更新"
            v-model:visible="updating"
            @ok="update"
            okText="切换到此版本"
            cancelText="取消"
        >
            <template v-if="selectedTag && updateLatestInfo">
                <item font-bold label="版本"> {{ selectedTag.name }} </item>
                <item font-bold label="大小">
                    {{ showFormatSize(updateLatestInfo.size) }}
                </item>
                <item font-bold label="发布时间">
                    {{ new Date(updateLatestInfo.date).toLocaleString() }}
                </item>
                <item font-bold label="手动下载地址">
                    <div>
                        <a :href="selectedTag.resource">{{ selectedTag.resource }}</a>
                    </div>
                </item>

                <item font-bold label="描述">
                    <MdRender :content="updateLatestInfo.message.join('<br>')" />
                </item>
            </template>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import json from "root/package.json";
import { Remote } from "@/utils/remote";
import { ref } from "vue";
import Card from "@/components/common/Card.vue";
import Item from "@/components/common/item.vue";
import { Empty } from "ant-design-vue";
import { fetchingInfo, Updater, updateInfos, refreshUpdateInfo } from "./updater";
import {
    showFormatSize,
    UpdateNotify,
    unzipResource,
    Tag,
    LatestType,
} from "./updater/types";
import { MdRender } from "mark-ui";

const path = require("path");

const simpleImg = Empty.PRESENTED_IMAGE_SIMPLE;

// 版本列表展示的当前值
const currentItem = ref(0);
// 需要展示的标签数量
const tagSize = ref(3);

const fileList = ref<File[]>([]);

function customRequest(info: any) {
    const ispack = Remote.app.get("isPackaged");
    if (ispack) {
        unzipResource(info.file.path, path.resolve("./resources/app"));
    } else {
        UpdateNotify("error", "当前不是生产模式，不能进行更新操作");
    }
}

function mouseEnter(index: number) {
    currentItem.value = index;
}
function mouseLeave() {
    currentItem.value = -1;
}

const selectedTag = ref<Tag>();

// 是否显示更新框

const updating = ref(false);
const updateLatestInfo = ref<LatestType>();

async function updateVersion(tag: Tag) {
    console.log("update", tag);
    updateLatestInfo.value = await Updater.getLatestInfo(tag);
    selectedTag.value = tag;
    updating.value = !updating.value;
}

function update() {
    if (selectedTag.value && updateLatestInfo.value) {
        Updater.update(selectedTag.value, updateLatestInfo.value);
    } else {
        UpdateNotify("error", "未选择更新版本，请重新选择");
    }
}
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

.tag-list {
    max-height: 800px;
    overflow: auto;
}
</style>
