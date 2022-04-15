<template>
  <div class="header">
    <template v-if="openSearch">
      <div class="d-flex align-items-center">
        <a-input-search
          class="rounded"
          size="small"
          placeholder="输入搜索文件名"
          @change="emits('update:searchValue', ($event.target as any).value)"
        />
        <Icon
          title="关闭搜索"
          class="ms-1"
          type="icon-close-circle"
          @click.stop="emits('update:openSearch', false)"
        />
      </div>
    </template>
    <template v-else>
      <div class="d-flex align-items-center">
        <div class="title">
          {{ title }}
        </div>
        <template v-if="expend">
          <template v-if="rootNode">
            <Icon
              title="新建文件夹"
              class="me-2"
              type="icon-folder-plus"
              @click.stop="rootNode ? mkdir(rootNode) : ''"
            />
            <Icon
              title="新建文件"
              class="me-2"
              type="icon-file-plus"
              @click.stop="rootNode ? createFile(rootNode) : ''"
            />
          </template>
          <Icon
            title="搜索文件"
            type="icon-search"
            @click.stop="emits('update:openSearch', true)"
          />
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import { createFile, FileNode, mkdir } from '../file/File';
interface ProjectHeaderProps {
  rootNode?: FileNode
  openSearch: boolean
  searchValue: string
  title: string
  expend: boolean
}
const props = withDefaults(defineProps<ProjectHeaderProps>(), {
  rootNode: undefined
});
const { rootNode, openSearch } = toRefs(props);

const emits = defineEmits<{
  (e: 'update:openSearch', value: boolean) : void
  (e: 'update:searchValue', value: string) : void
}>();
</script>

<style scope lang="less">
.header {
  white-space: nowrap;

  .title {
    font-size: 12px;
  }
}
</style>
