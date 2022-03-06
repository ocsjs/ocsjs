<template>
    <template v-if="content !== undefined">
        <div class="file">
            <div class="form-header text-start border-bottom">
                <div class="file-title">
                    <span> {{ file.title }} </span>
                    <div class="ms-2 actions">
                        <Icon
                            @click="showSource = !showSource"
                            :title="showSource ? '返回编辑' : '查看源文件'"
                            :type="showSource ? 'icon-edit-square' : 'icon-file-text'"
                        />
                        <Icon
                            @click="showTerminal = !showTerminal"
                            :title="showTerminal ? '关闭控制台' : '打开控制台'"
                            type="icon-codelibrary"
                        >
                        </Icon>
                        <Icon
                            @click="
                                (showTerminal = true),
                                    (file.stat.running = !file.stat.running)
                            "
                            :title="file.stat.running ? '关闭' : '运行'"
                            :type="
                                file.stat.running
                                    ? 'icon-close-circle'
                                    : 'icon-play-circle'
                            "
                            :style="{ color: file.stat.running ? '#f5222d' : '#1890ff' }"
                        />
                    </div>
                </div>

                <div class="file-path info text-secondary">
                    {{ file.path }}
                </div>
            </div>

            <div class="form-container">
                <template v-if="showSource">
                    <JSONEditor :json="JSON.stringify(content, null, 4)" />
                </template>

                <template v-else>
                    <Card title="启动设置">
                        <div class="form">
                            <label>隐身模式</label>
                            <span class="w-100 text-start">
                                <a-switch
                                    checked-children="开启"
                                    un-checked-children="关闭"
                                    v-model:checked="content.launchOptions.headless"
                                />
                            </span>
                        </div>
                        <div class="form">
                            <label>无痕浏览</label>
                            <span class="w-100 text-start">
                                <a-switch
                                    checked-children="开启"
                                    un-checked-children="关闭"
                                    v-model:checked="openIncognito"
                                />
                            </span>
                        </div>
                        <div class="form">
                            <label>浏览器路径</label>
                            <a-input
                                v-model:value="content.launchOptions.executablePath"
                                placeholder="浏览器路径"
                            />
                        </div>

                        <div class="form">
                            <label>登录类型</label>
                            <a-select
                                style="width: 100%"
                                v-model:value="content.scripts[0].name"
                                @change="onScriptChange"
                                show-search
                            >
                                <template
                                    v-for="(name, index) in scriptNames"
                                    :key="index"
                                >
                                    <a-select-option :value="name[0]">
                                        {{ name[1] }}
                                    </a-select-option>
                                </template>
                            </a-select>
                        </div>

                        <template v-for="(item, index) in loginTypeForms" :key="index">
                            <div class="form">
                                <label> {{ item.title }} </label>
                                <template v-if="item.type === 'text'">
                                    <a-input
                                        v-model:value="(content.scripts[0].options as any)[item.name]"
                                        :placeholder="'输入' + item.title"
                                    />
                                </template>
                                <template v-if="item.type === 'password'">
                                    <a-input-password
                                        v-model:value="(content.scripts[0].options as any)[item.name]"
                                        :placeholder="'输入' + item.title"
                                    />
                                </template>
                            </div>
                        </template>
                    </Card>
                </template>
            </div>

            <Transition name="fade">
                <div v-show="showTerminal" class="h-100 iterminal overflow-hidden">
                    <span> 控制台 </span>
                    <Terminal class="h-100" :running="file.stat.running" :file="file" />
                </div>
            </Transition>
        </div>
    </template>
    <template v-else>文件格式错误</template>
</template>

<script setup lang="ts">
import { toRefs, computed, ref, watch } from "vue";
import { FileNode, fs, path } from "./File";
import { scriptForms, Form } from ".";
import JSONEditor from "../JSONEditor.vue";
import { LaunchScriptsOptions } from "@ocsjs/scripts";
import { debounce } from "../../utils/index";
import Terminal from "../terminal/Terminal.vue";
import Card from "../Card.vue";
import { store } from "../../store";
import { notify } from "../../utils/notify";
import Icon from "../Icon.vue";

const { scriptNames } = require("@ocsjs/scripts");
interface FormCreateProps {
    file: FileNode;
}
const props = withDefaults(defineProps<FormCreateProps>(), {});
const { file } = toRefs(props);

/** 文件内容 */
const content = ref<LaunchScriptsOptions>();
try {
    content.value = JSON.parse(file.value.content);
} catch (e) {
    notify("文件格式错误", e, "file", { type: "error", copy: true });
}

/** 是否显示源码 */
const showSource = ref(false);

/** 是否显示终端 */
const showTerminal = ref(false);
/** 是否开启无痕模式 */
const openIncognito = ref(false);

setUserDataDir();

if (content.value) {
    watch(openIncognito, () => {
        if (content.value) {
            if (openIncognito.value) {
                content.value.userDataDir = "";
            } else {
                setUserDataDir();
            }
        }
    });

    /** 监听文件更新 */
    watch(
        content.value,
        debounce(() => {
            const value = JSON.stringify(content.value, null, 4);
            file.value.content = value;
            fs.writeFileSync(file.value.path, value);
        }, 500)
    );
}

/**
 * 解析第一个 script 内容，根据 script 的名字进行解析，并生成表单
 */
const loginTypeForms = computed(() => {
    if (content.value) {
        const target = scriptForms[content.value.scripts[0].name] as Form<any>;
        const keys = Reflect.ownKeys(target);
        return keys.map((key) => ({
            name: key,
            title: target[key].title,
            type: target[key].type,
        }));
    }
});

/** 登录脚本名更新时，重置options内容 */
function onScriptChange() {
    if (content.value) {
        content.value.scripts[0].options = {};
    }
}

function setUserDataDir() {
    if (content.value) {
        content.value.userDataDir = path.join(
            store["user-data-path"],
            "scriptUserData",
            file.value.uid
        );
    }
}
</script>

<style scope lang="less">
.file {
    height: 100%;
    display: grid;
    grid-template-rows: min-content auto auto;

    grid-template-areas:
        "header"
        "container "
        "terminal";
}

.form-header {
    background-color: white;
    padding: 12px;
    height: fit-content;
    overflow: auto;
    height: 100%;

    .info {
        font-size: 11px;
        color: #6c757d;
    }

    .file-title {
        font-size: 24px;
        font-weight: bold;
        display: inline-flex;
        white-space: nowrap;
        width: 100%;
    }

    .actions {
        width: 100%;
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;

        & * {
            font-size: 24px;
            cursor: pointer;
            margin-right: 8px;
        }
    }
}

.form-container {
    height: 100%;
    overflow: auto;
}

.iterminal {
    background: #32302f;
    color: #ededed;
    text-align: left;
    padding: 2px 0px 12px 12px;
    font-size: 10px;
}

.form {
    display: flex;
    white-space: nowrap;
    align-items: center;
    margin-bottom: 12px;

    .ant-input,
    .ant-input-password {
        border: none;
        border-bottom: 1px solid #dadada;
    }
    .ant-select .ant-select-selector {
        text-align: left;
        border: none !important;
        border-bottom: 1px solid #dadada !important;
    }

    label {
        width: 30%;
        text-align: left;

        &::after {
            content: "：";
        }
    }
}
</style>
