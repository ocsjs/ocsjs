<template>
    <div>
        <Card :bordered="false" color="blue" title="启动设置">
            <template #body>
                <a-descriptions :column="1" :labelStyle="{ fontWeight: 'bold' }">
                    <a-descriptions-item label="浏览器路径">
                        <div class="space-10 flex ai-center">
                            <span
                                class="path"
                                @click="
                                    launch.binaryPath && shell.openPath(launch.binaryPath)
                                "
                                >{{ launch.binaryPath || "未设置" }}
                            </span>
                            <FolderTwoTone @click="setBinaryPath()" />
                        </div>
                        <a-popover
                            placement="rightTop"
                            content="软件会自动检测您的谷歌浏览器路径，当路径未设置，或者你需要设置其他浏览器进行脚本操作，你可以点击蓝色的图片进行浏览器的路径设置"
                        >
                            <QuestionCircleOutlined />
                        </a-popover>
                    </a-descriptions-item>
                </a-descriptions>
            </template>
        </Card>

        <Card :bordered="false" color="blue" title="脚本设置">
            <Card :bordered="false" color="gray" title="全局设置" size="small">
                <a-descriptions :column="1" :labelStyle="{ fontWeight: 'bold' }">
                    <a-descriptions-item label="任务运行间隔时间">
                        <div class="space-10">
                            <a-input-number
                                size="small"
                                v-model:value="script.taskPeriod"
                                :min="3"
                                :max="60"
                            >
                            </a-input-number>
                            <span>秒</span>
                        </div>
                    </a-descriptions-item>
                </a-descriptions>
            </Card>
            <Card :bordered="false" color="gray" title="超星设置" size="small">
                <a-descriptions :column="1" :labelStyle="{ fontWeight: 'bold' }">
                    <a-descriptions-item label="自动播放视频">
                        <a-switch v-model:checked="script.cx.media.enable" />
                    </a-descriptions-item>
                    <a-descriptions-item label="" v-if="script.cx.media.enable">
                        <Card size="small" :close-collapse="true">
                            <a-descriptions :column="1">
                                <a-descriptions-item label="静音">
                                    <a-switch v-model:checked="script.cx.media.mute" />
                                </a-descriptions-item>
                                <a-descriptions-item label="倍速">
                                    <a-input-number
                                        size="small"
                                        v-model:value="script.cx.media.playbackRate"
                                        :min="1"
                                        :max="16"
                                    ></a-input-number>
                                </a-descriptions-item>
                            </a-descriptions>
                        </Card>
                    </a-descriptions-item>
                    <a-descriptions-item label="自动播放PPT">
                        <a-switch v-model:checked="script.cx.ppt" />
                    </a-descriptions-item>
                    <a-descriptions-item label="自动翻阅图书">
                        <a-switch v-model:checked="script.cx.book" />
                    </a-descriptions-item>
                    <a-descriptions-item label="自动做章节测验">
                        <a-switch v-model:checked="script.cx.qa.enable" />
                    </a-descriptions-item>
                    <a-descriptions-item v-if="script.cx.qa.enable">
                        <Card size="small" :close-collapse="true">
                            <a-descriptions :column="1">
                                <a-descriptions-item label="章节测验自动提交">
                                    <a-switch v-model:checked="script.cx.qa.autoReport" />
                                </a-descriptions-item>
                            </a-descriptions>
                        </Card>
                    </a-descriptions-item>
                    <a-descriptions-item label="自动做作业">
                        <a-switch v-model:checked="script.cx.work.enable" />
                    </a-descriptions-item>
                    <a-descriptions-item v-if="script.cx.work.enable">
                        <Card size="small" :close-collapse="true">
                            <a-descriptions :column="1">
                                <a-descriptions-item label="作业自动提交">
                                    <a-switch
                                        v-model:checked="script.cx.work.autoReport"
                                    />
                                </a-descriptions-item>
                            </a-descriptions>
                        </Card>
                    </a-descriptions-item>
                    <a-descriptions-item label="自动考试">
                        <a-switch v-model:checked="script.cx.exam.enable" />
                    </a-descriptions-item>
                    <a-descriptions-item v-if="script.cx.exam.enable">
                        <Card size="small" :close-collapse="true">
                            <a-descriptions :column="1">
                                <a-descriptions-item label="考试自动提交">
                                    <a-switch
                                        v-model:checked="script.cx.exam.autoReport"
                                    />
                                </a-descriptions-item>
                            </a-descriptions>
                        </Card>
                    </a-descriptions-item>
                </a-descriptions>
            </Card>
        </Card>

        <Card :bordered="false" color="blue" title="查题设置">
            <template #body>
                <a-descriptions :column="1" :labelStyle="{ fontWeight: 'bold' }">
                    <a-descriptions-item label="查题码">
                        <span class="space-10 ai-center">
                            <span>
                                <a-input
                                    type="text"
                                    size="small"
                                    style="width: 300px"
                                    v-model:value="account.queryToken"
                                    @blur="checkToken"
                                />
                            </span>
                            <a-popover
                                placement="rightTop"
                                content="必须配置查题码才能使用自动答题"
                            >
                                <QuestionCircleOutlined />
                            </a-popover>
                        </span>
                    </a-descriptions-item>

                    <template v-if="loading">
                        <span class="space-10">
                            <span>正在加载查题信息</span>
                            <LoadingOutlined />
                        </span>
                    </template>
                    <template v-else-if="tokenInfo.msg">
                        <a-descriptions-item label="提示">
                            <a-alert
                                show-icon
                                :message="tokenInfo.msg"
                                type="error"
                                style="height: 24px"
                            />
                        </a-descriptions-item>
                    </template>
                    <template v-else>
                        <a-descriptions-item label="剩余次数">
                            {{ tokenInfo.query_times }}
                        </a-descriptions-item>
                        <a-descriptions-item label="成功次数">
                            {{ tokenInfo.success_times }}
                        </a-descriptions-item>
                        <a-descriptions-item label="总查询次数">
                            {{ tokenInfo.all_times }}
                        </a-descriptions-item>
                    </template>
                </a-descriptions>
            </template>
        </Card>

        <Card :bordered="false" color="blue">
            <template #title>
                <span class="space-10">
                    <span>图形验证码破解(OCR)设置</span>
                    <a-popover
                        placement="rightTop"
                        content="当脚本遇到验证码的时候必须设置，否则需手动输入验证码验证"
                    >
                        <QuestionCircleOutlined />
                    </a-popover>
                </span>
            </template>
            <template #body>
                <a-descriptions :column="1" :labelStyle="{ fontWeight: 'bold' }">
                    <a-descriptions-item label="账号">
                        <span class="space-10">
                            <a-input
                                v-model:value="account.ocr.username"
                                type="text"
                                size="small"
                                style="width: 200px"
                            />
                        </span>
                    </a-descriptions-item>
                    <a-descriptions-item label="密码">
                        <span class="space-10">
                            <a-input-password
                                v-model:value="account.ocr.password"
                                size="small"
                                style="width: 200px"
                            />
                        </span>
                    </a-descriptions-item>
                    <a-descriptions-item label="账号注册">
                        <a href="http://www.ttshitu.com/login.html"
                            >http://www.ttshitu.com/login.html</a
                        >
                    </a-descriptions-item>
                </a-descriptions>
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
import { Remote } from "@/utils/remote";
import { AxiosGet } from "@/utils/request";

import { message } from "ant-design-vue";
import { ref, onMounted } from "vue";
import { config } from "@/utils/store";
import Card from "@/components/common/Card.vue";

const { launch, script, account } = config.setting.script;
const { shell } = require("electron");

// 加载状态
const loading = ref(true);

// 查题剩余次数
let tokenInfo = ref({
    all_times: 0,
    query_times: 0,
    success_times: 0,
    msg: "",
});
onMounted(() => {
    checkToken();
});
function checkToken() {
    loading.value = true;

    AxiosGet({
        url:
            "http://wk.enncy.cn/query/chatiId/" +
            config.setting.script.account.queryToken,
    })
        .then((res: any) => {
            if (res.data.code === 1) {
                tokenInfo.value = res.data.data;
            } else {
                tokenInfo.value.msg = "查题码无效，请重新填写";
            }
            loading.value = false;
        })
        .catch((err: any) => {
            console.error(err);

            message.error("获取查题次数失败");
        });
}

// 设置路径
function setBinaryPath() {
    launch.binaryPath = Remote.dialog
        .call("showOpenDialogSync", {
            properties: ["openFile"],
            multiSelections: false,
            defaultPath: launch.binaryPath,
        })
        .pop();
}
</script>

<style scope lang="less">
#app .ant-descriptions-row > td {
    padding-bottom: 6px;
}
</style>
