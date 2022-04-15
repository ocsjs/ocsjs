<template>
  <div>
    <Description
      :label="label"
      :desc="realPath"
      :text-class="'pointer'"
      @click="shell.showItemInFolder(realPath)"
    >
      <Icon
        v-if="setting"
        class="ms-3"
        type="icon-setting"
        @click.stop="change(name)"
      />
    </Description>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs } from 'vue';
import Description from './Description.vue';
import { remote } from '../utils/remote';

const Store = require('electron-store');
const path = require('path');

interface PathProps {
  name: string
  label: string
  setting?: boolean
}

const props = withDefaults(defineProps<PathProps>(), {
  setting: false
});

const { label, name, setting } = toRefs(props);
const store = new Store();
const { shell } = require('electron');

const realPath = ref(store.get(name.value) ? path.resolve(store.get(name.value)) : '无');

function change (name: string) {
  if (setting.value) {
    const res = remote.dialog.call('showOpenDialogSync', {
      properties: ['openDirectory'],
      defaultPath: realPath.value
    });
    if (res) {
      realPath.value = res[0];
      store.set(name, res[0]);
    }
  }
}
</script>

<style scope lang="less"></style>
