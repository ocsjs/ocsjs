<template>
    <div class="w-100">
        <div class="setting text-center p-2 col-12 col-md-10 col-lg-8">
            <Card title="基本设置">
                <Description label="开机自启">
                    <a-switch
                        size="small"
                        v-model:checked="store['auto-launch']"
                    ></a-switch>
                </Description>
                <Description label="软件置顶">
                    <a-switch
                        size="small"
                        v-model:checked="store['alwaysOnTop']"
                    ></a-switch>
                </Description>
                <Description label="窗口大小">
                    <a-input-number
                        size="small"
                        v-model:value="store.win.size"
                        :step="0.1"
                        :min="0"
                        :max="10"
                    ></a-input-number>
                </Description>
                <Description label="开发者模式">
                    <a-switch
                        size="small"
                        v-model:checked="store.win.devtools"
                    ></a-switch>
                </Description>
            </Card>

            <Card title="路径设置">
                <Path label="工作区路径" name="workspace" :setting="true" />
                <Path label="配置路径" name="config-path" />
                <Path label="数据路径" name="user-data-path" />
                <Path label="日志路径" name="logs-path" />
                <Path label="二进制文件" name="exe-path" />
            </Card>

            <div>
                <a-popconfirm
                    title="确认重置您的设置，并重新启动软件吗？"
                    ok-text="确认"
                    cancel-text="取消"
                    @confirm="reset"
                >
                    <a-button type="danger" shape="round" size="small">
                        重置设置
                        <Icon type="icon-redo" />
                    </a-button>
                </a-popconfirm>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs } from "vue";
import Card from "../../components/Card.vue";
import Description from "../../components/Description.vue";
import Path from "./Path.vue";
import { store } from "../../store";
import { remote } from "../../utils/remote";

function reset() {
    store.version = undefined;

    remote.app.call("relaunch");
    remote.app.call("exit", 0);
}
</script>

<style scope lang="less">
.setting {
    margin: 0 auto;
    min-height: 500px;
}
</style>
