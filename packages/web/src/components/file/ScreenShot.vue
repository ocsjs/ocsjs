
<template>
  <div class="screenshots">
    <div
      v-if="screenshots.length===0"
      class="w-100 m-auto"
    >
      <a-empty description="暂无预览图, 文件启动后将会自动获取。" />
    </div>
    <div
      v-else
      class="w-100"
    >
      <template
        v-for="(screenshot,index) of screenshots "
        :key="index"
      >
        <div class="screenshot">
          <span
            class="screenshot-title text-secondary"
            :title="screenshot.url"
          >
            {{ StringUtils.max(screenshot.title || '空白页', 20) }}
          </span>
          <img :src="`data:image/png;base64,${screenshot.base64}`">
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang='ts'>

import { toRefs } from 'vue';

interface ScreenShotProps{
  screenshots: {
    title:string
    url:string
    index:number,
    base64:string
  }[]
}
const { StringUtils } = require('@ocsjs/common');
const props = withDefaults(defineProps<ScreenShotProps>(), {});
const { screenshots } = toRefs(props);

</script>

<style scope lang='less'>

.screenshot{
  width: 96%;
  max-width: 96%;
  overflow: auto;
  height: fit-content;
  margin: 6px auto;
  border-radius: 6px;
  cursor: pointer;
  padding: 4px;

  img{
    box-shadow: 0px 0px 4px rgb(183 183 183);
    border-radius: 6px;
    width: 100%;
    max-height: 70vh;
    object-fit: cover;
  }
}

.screenshots{

  overflow: auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.screenshot-title{
  font-size: 12px;
  white-space: nowrap;
  text-overflow:ellipsis;
}

</style>
