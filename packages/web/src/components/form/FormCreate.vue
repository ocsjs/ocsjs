<template>
    <div>
        <div class="form-header text-start border-bottom">
            <div class="file-title">
                <span> {{ file.title }} </span>
                <a-space class="ms-2 actions">
                    <a class="source" @click="showSource = !showSource">
                        {{ showSource ? "返回编辑" : "查看源文件" }}
                    </a>
                </a-space>
            </div>
            <div class="file-path text-secondary">
                <span>路径: {{ file.path }}</span>
            </div>
        </div>

        <div class="form-container">
            <div v-if="showSource">
                <JSONEditor :json="JSON.stringify(content, null, 4)" />
            </div>

            <div v-else class="bg-white forms">
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
                        v-model:value="content.script.name"
                        show-search
                    >
                        <template v-for="(name, index) in scriptNames" :key="index">
                            <a-select-option :value="name[0]">
                                {{ name[1] }}
                            </a-select-option>
                        </template>
                    </a-select>
                </div>

                <template v-for="(item, index) in loginType" :key="index">
                    <div class="form">
                        <label> {{ item.title }} </label>
                        <template v-if="item.type === 'text'">
                            <a-input
                                v-model:value="(content.script.options as any)[item.name]"
                                :placeholder="'输入' + item.title"
                            />
                        </template>
                        <template v-if="item.type === 'password'">
                            <a-input-password
                                v-model:value="(content.script.options as any)[item.name]"
                                :placeholder="'输入' + item.title"
                            />
                        </template>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { toRefs, computed, ref, watch } from "vue";
import { FileNode, fs } from "../file/File";
import { Content, scriptForms, Form } from ".";
import JSONEditor from "../JSONEditor.vue";

const { scriptNames } = require("@ocsjs/scripts");

interface FormCreateProps {
    file: FileNode;
}

const props = withDefaults(defineProps<FormCreateProps>(), {});

const { file } = toRefs(props);

console.log(file.value);

const content = ref<Content>(JSON.parse(file.value.content));
const showSource = ref(false);

watch(content.value, () => {
    fs.writeFileSync(file.value.path, JSON.stringify(content.value, null, 4));
});

const loginType = computed(() => {
    const target = scriptForms[content.value.script.name] as Form<any>;
    const keys = Reflect.ownKeys(target);

    return keys.map((key) => ({
        name: key,
        title: target[key].title,
        type: target[key].type,
    }));
});
</script>

<style scope lang="less">
.form-header {
    background-color: white;
    padding: 12px;

    .file-title {
        font-size: 18px;
        font-weight: bold;
    }

    .file-path {
        font-size: 11px;
    }

    .actions {
        font-size: 11px;
    }
}

.form-container {
    padding: 12px 24px 12px 24px;
}

.forms {
    padding: 12px 24px 12px 24px;
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
