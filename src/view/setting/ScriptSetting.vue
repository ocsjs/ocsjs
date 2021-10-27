<template>
    <div>
        <setting-card :bordered="false" color="blue" title="启动设置">
            <setting
                label="浏览器路径"
                description="软件会自动检测您的谷歌浏览器路径，当路径未设置，或者你需要设置其他浏览器进行脚本操作，你可以点击蓝色的图片进行浏览器的路径设置"
            >
                <span
                    class="path"
                    @click="launch.binaryPath && shell.openPath(launch.binaryPath)"
                    >{{ launch.binaryPath || "未设置" }}
                </span>
                <template #after><FolderTwoTone  @click="setBinaryPath()" /></template>
                
            </setting>
        </setting-card>

        <setting-card :bordered="false" color="blue" title="脚本设置">
            <setting-card :bordered="false" color="gray" title="全局设置" size="small">
                <setting label="任务运行间隔时间">
                    <a-input-number
                        size="small"
                        v-model:value="script.taskPeriod"
                        :min="3"
                        :max="60"
                    >
                    </a-input-number>
                    <template  #after>秒</template>
                </setting>
            </setting-card>
            <setting-card :bordered="false" color="gray" title="超星设置" size="small">
                <setting label="自动播放音视频">
                    <a-switch v-model:checked="script.cx.media.enable" />
                </setting>
                <template v-if="script.cx.media.enable">
                    <setting-card close-collapse size="small">
                        <setting label="静音">
                            <a-switch v-model:checked="script.cx.media.mute" />
                        </setting>
                        <setting label="倍速">
                            <a-input-number
                                size="small"
                                v-model:value="script.cx.media.playbackRate"
                                :min="1"
                                :max="16"
                            ></a-input-number>
                        </setting>
                    </setting-card>
                </template>

                <setting label="自动播放PPT">
                    <a-switch v-model:checked="script.cx.ppt" />
                </setting>
                <setting label="自动翻阅图书">
                    <a-switch v-model:checked="script.cx.book" />
                </setting>
                <setting label="自动做章节测验">
                    <a-switch v-model:checked="script.cx.qa.enable" />
                </setting>
                <setting-card v-if="script.cx.qa.enable" size="small" close-collapse>
                    <setting label="章节测验自动提交">
                        <a-switch v-model:checked="script.cx.qa.autoReport" />
                    </setting>
                </setting-card>
                <setting label="自动做作业">
                    <a-switch v-model:checked="script.cx.work.enable" />
                </setting>
                <setting-card v-if="script.cx.work.enable" size="small" close-collapse>
                    <setting label="作业自动提交">
                        <a-switch
                            size="small"
                            v-model:checked="script.cx.work.autoReport"
                        />
                    </setting>
                </setting-card>
                <setting label="自动考试">
                    <a-switch v-model:checked="script.cx.exam.enable" />
                </setting>
                <setting-card v-if="script.cx.exam.enable" size="small" close-collapse>
                    <setting label="考试自动提交">
                        <a-switch v-model:checked="script.cx.exam.autoReport" />
                    </setting>
                </setting-card>
            </setting-card>
            <setting-card :bordered="false" color="gray" size="small" title="智慧树设置">
                <setting label="自动播放视频">
                    <a-input-number
                        size="small"
                        v-model:value="script.zhs.autoStop"
                        :defaultValue="0.5"
                        :min="0.5"
                        :max="24"
                        :step="0.5"
                        :formatter="(v:any)=>v+' 小时'"
                    ></a-input-number>
                </setting>

                <setting label="自动播放视频">
                    <a-switch v-model:checked="script.zhs.video.enable" />
                </setting>
                <template v-if="script.zhs.video.enable">
                    <setting-card close-collapse size="small">
                        <setting label="静音">
                            <a-switch v-model:checked="script.cx.media.mute" />
                        </setting>
                        <setting label="倍速">
                            <a-input-number
                                size="small"
                                v-model:value="script.cx.media.playbackRate"
                                :min="1"
                                :max="16"
                            ></a-input-number>
                        </setting>
                    </setting-card>
                </template>
                <setting label="自动做章节测验">
                    <a-switch v-model:checked="script.zhs.qa.enable" />
                </setting>
                <setting-card v-if="script.zhs.qa.enable" size="small" close-collapse>
                    <setting label="章节测验自动提交">
                        <a-switch v-model:checked="script.zhs.qa.autoReport" />
                    </setting>
                </setting-card>
                <setting label="自动做作业">
                    <a-switch v-model:checked="script.zhs.work.enable" />
                </setting>
                <setting-card v-if="script.zhs.work.enable" size="small" close-collapse>
                    <setting label="作业自动提交">
                        <a-switch
                            size="small"
                            v-model:checked="script.zhs.work.autoReport"
                        />
                    </setting>
                </setting-card>
                <setting label="自动考试">
                    <a-switch v-model:checked="script.zhs.exam.enable" />
                </setting>
                <setting-card v-if="script.zhs.exam.enable" size="small" close-collapse>
                    <setting label="考试自动提交">
                        <a-switch v-model:checked="script.zhs.exam.autoReport" />
                    </setting>
                </setting-card>
            </setting-card>
        </setting-card>

        <setting-card :bordered="false" color="blue" title="查题设置">
            <setting description="必须配置查题码才能使用自动答题" label="查题码">
                <a-input
                    type="text"
                    size="small"
                    style="width: 300px"
                    v-model:value="account.queryToken"
                    @blur="checkToken"
                />
            </setting>

            <template v-if="loading">
                <setting label="提示">
                    <span>正在加载查题信息 <LoadingOutlined /></span>
                </setting>
            </template>
            <template v-else-if="tokenInfo.msg">
                <setting label="提示">
                    <a-alert
                        show-icon
                        :message="tokenInfo.msg"
                        type="error"
                        style="height: 24px"
                    />
                </setting>
            </template>
            <template v-else>
                <setting :text="tokenInfo.query_times" label="剩余次数" />
                <setting :text="tokenInfo.success_times" label="成功次数" />
                <setting :text="tokenInfo.all_times" label="总查询次数" />
            </template>
        </setting-card>

        <setting-card
            :bordered="false"
            color="blue"
            title="图形验证码破解(OCR)设置"
            description="当脚本遇到验证码的时候必须设置，否则需手动输入验证码验证"
        >
            <setting label="账号">
                <a-input
                    v-model:value="account.ocr.username"
                    type="text"
                    size="small"
                    style="width: 200px"
                />
            </setting>
            <setting label="密码">
                <a-input-password
                    v-model:value="account.ocr.password"
                    size="small"
                    style="width: 200px"
                />
            </setting>
            <setting label="账号注册">
                <a href="http://www.ttshitu.com/login.html"
                    >http://www.ttshitu.com/login.html</a
                >
            </setting>
        </setting-card>
    </div>
</template>

<script setup lang="ts">
import { Remote } from "@/utils/remote";
import { AxiosGet, NetWorkCheck } from "@/utils/request";

import { message } from "ant-design-vue";
import { ref, onMounted, h } from "vue";
import { config } from "@/utils/store";
import Card from "@/components/common/Card.vue";

import { FolderTwoTone } from "@ant-design/icons-vue/lib/icons";
import Setting from "@/components/common/Setting.vue";
import SettingCard from "@/components/common/SettingCard.vue";

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
onMounted(async () => {
    await checkToken();
});
async function checkToken() {
    if (await NetWorkCheck()) {
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

                message.error("获取查题次数失败,可能为网络错误！");
            });
    } else {
    }
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

.ant-switch {
    min-width: 36px;
    height: 18px;
}
.ant-switch::after {
    width: 14px;
    height: 14px;
}
</style>
