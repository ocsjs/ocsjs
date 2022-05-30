<template>
  <div
    id="ocs-panel"
    ref="panel"
    :class="hide ? 'hide' : ''"
  >
    <div class="alert-container">
      <template
        v-for="(item,index) of ctx.common.alerts"
        :key="index"
      >
        <Alert
          :style="{opacity: 1 - (ctx.common.alerts.length - 1 - index) * (1/ctx.common.alerts.length)}"
          :type="item.type"
          :text="item.text"
          :index="index"
        />
      </template>
    </div>

    <template v-if="hide">
      <Tooltip
        :tooltip-style="{transform: 'translate(-36%, -110%)' , textAlign:'center', fontSize: '12px'}"
        :title="`OCS 网课助手 ${useStore('VERSION')}<br>单击拖动<br>双击展开<br>连续按下ocs三个键可复原位置<br>想要完全隐藏可移出屏幕`"
      >
        <img
          ref="logo"
          class="ocs-icon"
          src="https://cdn.ocs.enncy.cn/logo.png"
          @dblclick="hide = false"
          @click="(e) => e.stopPropagation()"
        >
      </Tooltip>
    </template>
    <template v-else>
      <!-- 标题栏 -->
      <div
        ref="panelHeader"
        class="ocs-panel-header draggable"
      >
        <template
          v-for="(item, index) in currentPanels"
          :key="index"
        >
          <div
            :panel-title="item.name"
            class="title"
            :class="item.name === activeKey ? 'active' : ''"
            @click="activeKey = item.name"
          >
            <span>{{ item.name }}</span>
          </div>
        </template>
      </div>

      <!-- 内容栏 -->
      <div
        ref="panelContainer"
        class="ocs-panel-container"
      >
        <template
          v-for="(item, index) in currentPanels"
          :key="index"
        >
          <div
            v-show="item.name === activeKey"
            :panel="item.name"
          >
            <component :is="item.el()" />
          </div>
        </template>
      </div>

      <!-- 底部栏 -->
      <div
        ref="panelFooter"
        class="ocs-panel-footer draggable"
      >
        <span
          class="hide-btn"
          @click="hide = true"
        > 点击缩小 </span>
        <span> OCS 网课助手 {{ useStore('VERSION') }} </span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, Ref } from '@vue/reactivity';
import { nextTick, onMounted, ref, watch } from 'vue';
import { Alert } from './components/alert';
import { Tooltip } from './components/Tooltip';
import { addFunctionEventListener, dragElement, getCurrentPanels } from './core/utils';
import { definedScripts } from './main';
import { useContext, useStore } from './store';

const ctx = useContext();

const local = useStore('localStorage');

const panels = ref(getCurrentPanels(definedScripts));

const hide = ref(local.hide);

/**
 * 对面板进行处理
 *
 * 当所有面板都为 default 状态的时候，才显示 default 面板
 *
 * 否则显示其他面板
 */
const currentPanels = computed(() => {
  return (panels.value.every((panel) => panel.default === true)
    ? panels.value
    : panels.value.filter((panel) => !panel.default)
  ).sort((a, b) => (b.priority || 0) - (a.priority || 0));
});

/**
 * 当前面板的 key
 */
const activeKey = ref(currentPanels.value[0]?.name);
/**
 * 元素
 */
const panel: Ref<HTMLElement | undefined> = ref(undefined);
const panelHeader: Ref<HTMLElement | undefined> = ref(undefined);
const panelContainer: Ref<HTMLElement | undefined> = ref(undefined);
const panelFooter: Ref<HTMLElement | undefined> = ref(undefined);
const logo: Ref<HTMLElement | undefined> = ref(undefined);

/** 当面板发生改变时重绘 */
watch(currentPanels, () => {
  const key = currentPanels.value.find((p) => p.name === activeKey.value);

  /** 缓存页面，  如果存在相同的面板，则不切换，否则切换回到第一个页面 */
  if (!key) {
    activeKey.value = currentPanels.value[0].name;
  }
});

watch(hide, () => {
  local.hide = hide.value;
  nextTick(() => {
    enablePanelDrag();
  });
});

onMounted(() => {
  nextTick(() => {
    listenResetEvent();
    enablePanelDrag();
    listenHistoryChange();
    let { x, y } = local.position;
    // 设置初始位置
    if (panel.value && x && y) {
      // 判断移动后的坐标是否超出了屏幕，如果超出则重置为初始位置

      const { width, height } = panel.value.getBoundingClientRect();
      const { innerWidth, innerHeight } = window;
      if (x < 0) {
        x = width - 50;
      }
      if (y < 0) {
        y = height;
      }
      if (x + width > innerWidth) {
        x = innerWidth - width - 50;
      }
      if (y < 0 || y + height > innerHeight) {
        y = innerHeight - height - 50;
      }

      panel.value.style.left = `${x}px`;
      panel.value.style.top = `${y}px`;
    }
  });
});

/**
 * 启用面板拖拽
 */
function enablePanelDrag() {
  if (panel.value && ctx.common.startOptions?.draggable) {
    if (logo.value) {
      dragElement(logo.value, panel.value, onMove);
    }
    if (panelHeader.value && panelFooter.value) {
      dragElement(panelHeader.value, panel.value, onMove);
      dragElement(panelFooter.value, panel.value, onMove);
    }
  }
}

function onMove(x: number, y: number) {
  local.position.x = x;
  local.position.y = y;
}

/**
 * 监听重置位置
 */
function listenResetEvent() {
  const target = ['o', 'c', 's'];
  let stack: string[] = [];

  onkeydown = (e) => {
    if (target.includes(e.key)) {
      stack.push(e.key);
      console.log(stack.join(''));

      const contains = stack.join('').includes(target.join(''));

      if (contains) {
        if (panel.value) {
          panel.value.style.top = '20%';
          panel.value.style.bottom = 'unset';
          panel.value.style.left = '50%';
        }
        stack = [];
      }
    } else {
      stack = [];
    }
  };
}

function listenHistoryChange() {
  history.pushState = addFunctionEventListener(history, 'pushState');
  history.replaceState = addFunctionEventListener(history, 'replaceState');

  window.addEventListener(
    'pushState',
    () => (panels.value = getCurrentPanels(definedScripts))
  );
  window.addEventListener(
    'replaceState',
    () => (panels.value = getCurrentPanels(definedScripts))
  );
}

</script>

<style  scope lang="less">
@import './assets/less/common.less';

</style>
