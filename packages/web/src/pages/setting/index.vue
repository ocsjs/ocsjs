<template>
  <div class="w-100">
    <div class="setting text-center p-2 col-12 col-md-10 col-lg-8">
      <Card title="基本设置">
        <Description label="开机自启">
          <a-switch
            v-model:checked="store['auto-launch']"
            size="small"
          />
        </Description>

        <Description label="窗口大小">
          <a-input-number
            v-model:value="store.win.size"
            size="small"
            :step="0.1"
            :min="0"
            :max="10"
          />
        </Description>
      </Card>

      <Card title="默认设置">
        <Description label="指定浏览器">
          <a-select
            size="small"
            class="w-100"
            :default-value="browserType"
            @change="onBrowserTypeChange"
          >
            <a-select-option value="diy">
              自定义浏览器
            </a-select-option>
            <template
              v-for="(key, index) in keys"
              :key="index"
            >
              <a-select-option :value="(store.validBrowserPaths as any)[key]">
                {{ key }}
              </a-select-option>
            </template>
          </a-select>
        </Description>
        <Description
          v-if="browserType === 'diy'"
          label="自定义浏览器路径"
        >
          <a-input
            v-model:value="launchOptions.executablePath"
            size="small"
            class="w-100"
          >
            <template #suffix>
              <a-popover>
                <template #title>
                  <b>浏览器路径获取方式</b>
                </template>
                <template #content>
                  <div>
                    <b>谷歌浏览器</b> : 打开谷歌浏览器 <br>
                    访问
                    <b>chrome://version</b> 找到 <b>可执行文件路径</b> 复制粘贴即可
                  </div>
                  <div>
                    <b>Edge浏览器</b> : 打开Edge浏览器<br>
                    访问
                    <b>edge://version</b> 找到 <b>可执行文件路径</b> 复制粘贴即可
                  </div>
                </template>

                <Icon type="icon-question-circle" />
              </a-popover>
            </template>
          </a-input>
        </Description>
        <Description
          v-else
          label="默认路径"
        >
          {{ launchOptions.executablePath }}
        </Description>

        <Description label="默认题库设置">
          <a-input
            size="small"
            class="w-100"
            type="text"
            :value="answererWrapper"
            @change="onAWChange($event)"
          >
            <template #suffix>
              <a-popover>
                <template #content>
                  <div><b>请直接复制粘贴，不要一个个字输入</b></div>
                  <div>
                    <b>题库配置教程</b> :
                    <a
                      href="#"
                      @click="
                        link(
                          'https://enncy.github.io/online-course-script/answerer-wrappers'
                        )
                      "
                    >https://enncy.github.io/online-course-script/answerer-wrappers</a>
                  </div>
                </template>

                <Icon type="icon-question-circle" />
              </a-popover>
            </template>
          </a-input>
        </Description>
      </Card>

      <Card title="路径设置">
        <Path
          label="工作区路径"
          name="workspace"
          :setting="true"
        />
        <Path
          label="配置路径"
          name="config-path"
        />
        <Path
          label="数据路径"
          name="user-data-path"
        />
        <Path
          label="日志路径"
          name="logs-path"
        />
        <Path
          label="二进制文件"
          name="exe-path"
        />
      </Card>

      <div class="mt-4">
        <a-popconfirm
          title="确认重置您的设置，并重新启动软件吗？"
          ok-text="确认"
          cancel-text="取消"
          @confirm="reset"
        >
          <a-button
            shape="round"
            size="small"
            danger
          >
            重置设置
          </a-button>
        </a-popconfirm>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from '../../components/Card.vue';
import Description from '../../components/Description.vue';
import Path from '../../components/Path.vue';
import { store } from '../../store';
import { remote } from '../../utils/remote';
import { LaunchOptions } from '@ocsjs/scripts';
import { ref } from 'vue';
const { shell } = require('electron');

const launchOptions = store.script.launchOptions as LaunchOptions;

const keys = Reflect.ownKeys(store.validBrowserPaths);

const answererWrapper = ref(
  store.script.localStorage?.setting?.answererWrappers
    ? JSON.stringify(store.script.localStorage?.setting?.answererWrappers)
    : ''
);

const browserType = ref(
  keys.find(
    (key) => (store.validBrowserPaths as any)[key] === launchOptions.executablePath
  ) || 'diy'
);

function reset() {
  store.version = undefined;

  remote.app.call('relaunch');
  remote.app.call('exit', 0);
}

function onBrowserTypeChange(val: string) {
  launchOptions.executablePath = val === 'diy' ? '' : val;
  browserType.value =
    keys.find(
      (key) => (store.validBrowserPaths as any)[key] === launchOptions.executablePath
    ) || 'diy';
}

function link(url: string) {
  shell.openExternal(url);
}

function onAWChange(e: Event) {
  // @ts-ignore
  const val = e.target.value;

  store.script.localStorage.setting.answererWrappers = val ? JSON.parse(val) : '';

  answererWrapper.value = val;
}
</script>

<style scope lang="less">
.setting {
  margin: 0 auto;
  min-height: 500px;
}
</style>
