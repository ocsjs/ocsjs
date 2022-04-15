<template>
  <div
    id="workspace"
    class="text-center h-100 d-flex"
  >
    <!-- 搜索文件夹 -->
    <div class="files resizable overflow-auto col-4 p-2 border-end">
      <!-- projects : 真实路径的工作项目节点 -->
      <template v-for="(project, index) in projects">
        <ProjectNode
          v-if="project.node.children"
          :key="index"
          :root-node="project.node"
          :title="project.title"
        />
      </template>
      <!-- 虚拟节点 -->
      <ProjectNode
        :files="Project.opened.value"
        title="打开的文件"
      />
    </div>
    <div class="w-100 h-100 overflow-auto">
      <template v-if="Project.opened.value.every((file) => file.stat.show === false)">
        <!-- 显示帮助页面 -->
        <Help class="help" />
      </template>
      <template v-else>
        <template
          v-for="(file, index) of Project.opened.value"
          :key="index"
        >
          <div
            v-show="file.stat.show"

            class="h-100"
          >
            <File :file="file" />
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';

import { store } from '../../store';
import interact from 'interactjs';
import { Project } from '../../components/project';
import File from '../../components/file/File.vue';
import ProjectNode from '../../components/project/ProjectNode.vue';
import Help from '../../components/Help.vue';

const projects = ref<Project[]>([]);

// @ts-ignore
window.projects = projects;
// @ts-ignore
window.Project = Project;
// @ts-ignore
window.electron = require('electron');

onMounted(() => {
  nextTick(() => {
    projects.value.push(Project.create('工作区', store.workspace));

    /** 边框拖拽，改变目录大小 */
    interact('.resizable').resizable({
      edges: { top: false, left: false, bottom: false, right: true },
      margin: 20,
      listeners: {
        move: function (event: any) {
          let { x, y } = event.target.dataset;

          x = (parseFloat(x) || 0) + event.deltaRect.left;
          y = (parseFloat(y) || 0) + event.deltaRect.top;

          Object.assign(event.target.style, {
            width: `${event.rect.width}px`,
            height: `${event.rect.height}px`,
            transform: `translate(${x}px, ${y}px)`
          });

          Object.assign(event.target.dataset, { x, y });
        }
      }
    });
  });
});
</script>

<style scope lang="less">
#workspace {
  padding: 0;

  .files {
    max-width: 50vw;
    min-width: 180px;
    height: 100% !important;
    background-color: white;
  }

  .help {
    top: 30%;
    position: relative;
  }
}

#nav {
  position: sticky;
  top: 48px;
  z-index: 99;
}

#breadcrumb {
  white-space: nowrap;
  overflow: auto;
}

#actions {
  display: inline-flex;
  flex-wrap: nowrap;
  button {
    margin: 0 4px;
  }
}

.dirs {
  display: grid;
  grid-template-columns: repeat(auto-fill, 120px);
  grid-template-rows: auto;
}

.dir {
  border-radius: 4px;
  width: 100%;

  .dir-name {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  svg {
    width: 48px;
    height: 48px;
  }

  &.select {
    box-shadow: 0px 0px 4px #40a9ff7b;
  }
}

.dir:first-child {
  margin: 0;
}

[role="menuitem"],
[role="menu"] {
  width: 180px;
}
</style>
