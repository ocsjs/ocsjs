<template>
  <div class="main h-100">
    <Title />
    <Index />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted } from 'vue';
import Title from './components/Title.vue';
import Index from './pages/index.vue';
import { handleFile, initOpenFiles, setAutoLaunch, setZoomFactor } from './store';
import { fetchRemoteNotify } from './utils';
import { notify } from './utils/notify';
import { remote } from './utils/remote';

const { ipcRenderer } = require('electron');

onMounted(() => {
  nextTick(() => {
    /** 获取最新远程通知 */
    fetchRemoteNotify(false);

    /** 如果正在更新的话，获取更新进度 */
    ipcRenderer.on('update', (e, tag, rate, totalLength, chunkLength) => {
      notify(
        'OCS更新程序',
        `更新中: ${(chunkLength / 1024 / 1024).toFixed(2)}MB/${(totalLength / 1024 / 1024).toFixed(2)}MB`,
        'updater',
        { type: 'info', duration: 5, close: false }
      );
    });

    /** 初始化 store */

    remote.logger.call('info', 'render store init');
    setZoomFactor();
    setAutoLaunch();
    initOpenFiles();

    ipcRenderer.on('open-file', (e, file) => {
      handleFile(file);
    });
  });
});
</script>

<style lang="less">
@import '@/assets/css/bootstrap.min.css';
@import '@/assets/css/common.css';

.main {
  display: grid;
  grid-template-rows: 28px calc(100vh - 28px);
  grid-template-areas:
    'header'
    'main ';
}

.ant-modal-confirm .ant-modal-body {
  padding: 12px !important;
}
</style>
