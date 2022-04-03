<template>
    <template v-if="data.options !== undefined">
        <div class="file">
            <div class="form-header text-start border-bottom">
                <div class="file-title">
                    <a-space>
                        <span>
                            {{ file.title }}
                        </span>

                        <a class="link" @click="closeEditor">关闭</a>
                        <a class="link" @click="openEditor">打开</a>
                    </a-space>
                    <a-space class="actions" :size="12">
                        <Icon
                            @click="data.activeKey = 'setting'"
                            title="设置"
                            type="icon-edit-square"
                            :style="{
                                color: data.activeKey === 'setting' ? '#1890ff' : '',
                            }"
                        />
                        <Icon
                            @click="data.activeKey = 'content'"
                            title="源文件"
                            type="icon-file-text"
                            :style="{
                                color: data.activeKey === 'content' ? '#1890ff' : '',
                            }"
                        />

                        <Icon
                            @click="data.activeKey = 'terminal'"
                            title="控制台"
                            type="icon-codelibrary"
                            :style="{
                                color: data.activeKey === 'terminal' ? '#1890ff' : '',
                            }"
                        >
                        </Icon>
                        <Icon
                            @click="submitData"
                            :title="file.stat.running ? '关闭' : '运行'"
                            :type="
                                file.stat.running
                                    ? 'icon-close-circle'
                                    : 'icon-play-circle'
                            "
                            :style="{
                                color: file.stat.running ? '#f5222d' : '#1890ff',
                            }"
                        />

                        <template v-if="data.process.launched">
                            <Icon
                                type="icon-totop"
                                title="显示当前的浏览器"
                                @click="data.process.bringToFront()"
                            />
                        </template>
                    </a-space>
                </div>

                <div class="file-path info text-secondary">
                    {{ file.path }}
                </div>
            </div>

            <div class="form-container">
                <CodeHighlight
                    class="h-100"
                    v-show="data.activeKey === 'content'"
                    lang="json"
                    :code="data.content"
                ></CodeHighlight>

                <div
                    v-show="data.activeKey === 'terminal'"
                    class="iterminal overflow-hidden h-100"
                >
                    <a-space class="iterminal-items">
                        <span>控制台</span>
                        <span @click="data.xterm.clear()">清空</span>
                    </a-space>

                    <Terminal
                        class="h-100"
                        :xterm="data.xterm"
                        :file="file"
                        :process="data.process"
                    />
                </div>

                <Card v-show="data.activeKey === 'setting'" title="启动设置">
                    <div class="form">
                        <label>自动更新OCS脚本</label>
                        <span class="w-100 text-start">
                            <a-switch
                                checked-children="开启"
                                un-checked-children="关闭"
                                v-model:checked="data.options.init"
                            />
                        </span>
                    </div>

                    <div class="form">
                        <label>登录类型</label>
                        <a-select
                            style="width: 100%"
                            v-model:value="data.options.scripts[0].name"
                            @change="onScriptChange"
                            show-search
                        >
                            <template v-for="(name, index) in scriptNames" :key="index">
                                <a-select-option :value="name[0]">
                                    {{ name[1] }}
                                </a-select-option>
                            </template>
                        </a-select>
                    </div>

                    <form ref="dataForm">
                        <template v-for="(item, index) in loginTypeForms" :key="index">
                            <div class="form">
                                <label> {{ item.title }} </label>
                                <template v-if="['tel', 'text'].includes(item.type)">
                                    <a-input
                                        :type="item.type"
                                        v-model:value="(data.options.scripts[0].options as any)[item.name]"
                                        :placeholder="'输入' + item.title"
                                        :required="item.required"
                                        :name="item.name"
                                    />
                                </template>
                                <template v-if="item.type === 'password'">
                                    <a-input-password
                                        v-model:value="(data.options.scripts[0].options as any)[item.name]"
                                        :placeholder="'输入' + item.title"
                                        :required="item.required"
                                        :name="item.name"
                                    />
                                </template>
                            </div>
                        </template>
                    </form>
                </Card>
            </div>
        </div>
    </template>
    <template v-if="data.error">
        <div class="error-page">
            <div class="error-message w-100">
                <a-space>
                    <span>解析文件时第 {{ data.error?.line }} 行发生错误:</span>
                    <a class="link" @click="closeEditor">关闭</a>
                    <a class="link" @click="openEditor">打开</a>
                </a-space>
                <pre>{{ data.error?.message }}</pre>

                <CodeHighlight
                    class="json-editor border rounded overflow-auto"
                    lang="json"
                    :code="data.content"
                    :error-line="data.error?.line"
                ></CodeHighlight>
            </div>
        </div>
    </template>
</template>

<script setup lang="ts">
import { toRefs, computed, ref, watch, reactive, onUnmounted, onMounted } from "vue";
import { FileNode, fs, validFileContent, path } from "./File";
import { scriptForms, Form } from ".";
import CodeHighlight from "../CodeHighlight.vue";
import { LaunchScriptsOptions } from "@ocsjs/scripts";
import { debounce } from "../../utils/index";
import Terminal from "../terminal/Terminal.vue";
import Card from "../Card.vue";
import { store } from "../../store";
import Icon from "../Icon.vue";
import { Process } from "../terminal/process";
import { ITerminal } from "../terminal";
import { Project } from "../project";
import { message } from "ant-design-vue";
const { scriptNames } = require("@ocsjs/scripts");
const childProcess = require("child_process") as typeof import("child_process");

interface FormCreateProps {
    file: FileNode;
}
const props = withDefaults(defineProps<FormCreateProps>(), {});
const { file } = toRefs(props);

/** 解析文件内容 */
const result = validFileContent(file.value.content);
let options;
let error;
if (typeof result === "string") {
    options = JSON.parse(result);
} else {
    error = result.error;
}

const data = reactive<{
    activeKey: "setting" | "terminal" | "content";
    content: string;
    options?: LaunchScriptsOptions;
    error?: { message: string; line: number };
    process: Process;
    xterm: ITerminal;
}>({
    /** 显示的页面 */
    activeKey: "setting",
    /** 文件内容 */
    content: fs.readFileSync(file.value.path).toString(),
    /** 解析内容 */
    options: options,
    /** 是否错误 */
    error: error,

    /** 运行的子进程对象 */
    process: new Process(file.value.uid, store["logs-path"]),
    /** 终端对象 */
    xterm: new ITerminal(file.value.uid),
});

if (data.options && data.error === undefined) {
    /** 监听文件更新 */
    watch(
        data.options,
        debounce(() => {
            const value = JSON.stringify(data.options, null, 4);
            data.content = value;
            fs.writeFileSync(file.value.path, value);
        }, 500)
    );
}

const dataForm = ref();

/**
 * 解析第一个 script 内容，根据 script 的名字进行解析，并生成表单
 */
const loginTypeForms = computed(() => {
    if (data.options) {
        const target = scriptForms[data.options.scripts[0].name] as Form<any>;
        const keys = Reflect.ownKeys(target);
        return keys.map((key) => ({
            name: key,
            title: target[key].title,
            type: target[key].type,
            required: target[key].required,
        }));
    }
});

/** 登录脚本名更新时，重置options内容 */
function onScriptChange() {
    if (data.options) {
        data.options.scripts[0].options = {};
    }
}

/** 验证表单 */
function submitData() {
    if (!store.script.launchOptions.executablePath) {
        message.error("请前往 设置 -> 指定浏览器 , 设置您的默认浏览器。");
    } else {
        if (dataForm.value.checkValidity()) {
            run();
        } else {
            dataForm.value.reportValidity();
        }
    }
}

/** 运行文件 */
function run() {
    if (data.options) {
        data.activeKey = "terminal";
        file.value.stat.running = !file.value.stat.running;

        if (file.value.stat.running) {
            /** 如未初始化控制台面板，则先初始化 */
            if (data.process.shell === undefined) data.process.init(data.xterm);
            /**  初始化文件 */

            /** 运行 */
            data.process.launch(data.options);
        } else {
            data.process.close();
        }
    }
}

function closeEditor() {
    Project.opened.value = Project.opened.value.filter((f) => f.path !== file.value.path);
    /** 切换编辑到最后一个文件 */
    const len = Project.opened.value.length;
    if (len) {
        Project.opened.value[len - 1].stat.show = true;
    }
}

function openEditor() {
    childProcess.exec(`notepad "${file.value.path}"`);
}

onUnmounted(() => {
    data.process.close();
});
</script>

<style scope lang="less">
.error-page {
    width: 100%;
    padding-top: 50px;
    text-align: left;

    .error-message {
        padding: 4px;
        width: fit-content;
        margin: 0 auto;

        .json-editor {
            width: 100%;
        }
    }
}

.file {
    height: 100%;

    display: grid;
    grid-template-rows: min-content auto;
}

.form-header {
    background-color: white;
    padding: 12px;
    height: fit-content;
    overflow: auto;

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

        .link {
            font-size: 11px;
        }
    }

    .actions {
        width: 100%;
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;

        & * {
            font-size: 24px;
            cursor: pointer;
        }
    }
}

.form-container {
    overflow: auto;
}

.iterminal {
    height: fit-content;
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
    .ant-input-password,
    .ant-input-affix-wrapper {
        border: none;
        border-bottom: 1px solid #dadada;
    }
    .ant-select .ant-select-selector {
        text-align: left;
        border: none !important;
        border-bottom: 1px solid #dadada !important;
    }

    label {
        width: 40%;
        text-align: left;

        &::after {
            content: "：";
        }
    }
}

.iterminal-items {
    * {
        cursor: pointer;
    }
}
</style>
