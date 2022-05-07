import { App as VueApp, createApp } from 'vue';
import App from './App.vue';
import { DefineScript } from './core/define.script';
import { dragElement, getCurrentRoutes, isInBrowser, onComplete, onInteractive, togglePanel } from './core/utils';
import { logger } from './logger';
import { definedScripts } from './main';
import { createStore, setStore, store } from './script';

export interface StartOptions {
  /**
   * 面板样式 url | string
   */
  style?: string
  /**
   * 是否开启面板拖拽
   */
  draggable?: boolean
  /** 脚本列表 */
  scripts?: DefineScript[]
}

/** 面板元素 */
export let panel: HTMLElement | undefined | null;
/** vue app 元素 */
export let app: VueApp;

export let loaded = false;

/**
 * 显示面板，检测是否存在需要运行的脚本，并执行
 */
export function start (options?: StartOptions) {
  // 初始化 store 变量
  initStore();

  // 加载面板
  if (top === window) {
    onComplete(() => {
      if (!loaded) {
        loaded = true;
        showPanels(options);
      }
    });
    onInteractive(() => {
      if (!loaded) {
        loaded = true;
        showPanels(options);
      }
    });
  }

  // 执行脚本
  executeScripts(options?.scripts || definedScripts);
}

function initStore() {
  // 环境检测
  if (isInBrowser()) {
    if (typeof unsafeWindow !== 'undefined') {
      setStore(createStore());
    }

    onComplete(() => {
      if (typeof unsafeWindow !== 'undefined') {
      // 统一转向顶层对象
      // eslint-disable-next-line no-undef
        setStore(unsafeWindow.top?.OCS.store || store);
      } else {
        logger('warn', '为了确保功能正常使用, 请在油猴环境下运行 https://www.tampermonkey.net/');
      }
    });
  }
}

/**
 * 显示面板
 */
export function showPanels (options?: StartOptions) {
  const { draggable } = options || {};

  /** 绑定元素 */
  app = createApp(App);
  panel = document.createElement('ocs-panel');
  document.body.appendChild(panel);
  app.mount(panel);

  if (draggable) {
    dragElement('ocs-panel .ocs-panel-header', panel, onMove);
    dragElement('ocs-panel .ocs-panel-footer', panel, onMove);
    dragElement('.ocs-icon', panel, onMove);

    function onMove (x: number, y: number) {
      store.localStorage.position.x = x;
      store.localStorage.position.y = y;
    }
  }

  // 设置初始位置
  if (store.localStorage.position.x && store.localStorage.position.y) {
    panel.style.left = `${store.localStorage.position.x}px`;
    panel.style.top = `${store.localStorage.position.y}px`;
  }

  if (store.localStorage.hide) {
    togglePanel(false);
  }

  logger('info', `OCS ${store.VERSION} 加载成功`);
}

/**
 * 执行脚本
 */
export function executeScripts (scripts: DefineScript[]) {
  window.addEventListener('unhandledrejection', (event) => {
    logger('error', event.reason.toString());
    console.error(event.reason);
  });
  try {
    const routes = getCurrentRoutes(scripts);
    if (window.document.readyState === 'complete') {
      load();
    } else {
      /** 加载后执行 */
      window.addEventListener('load', load);
    }

    function load () {
      for (const route of routes.filter((route) => route.onload)) {
        route.onload?.();
      }
    }

    /** 立即执行 */
    for (const route of routes.filter((route) => route.start)) {
      route.start?.();
    }
  } catch (e) {
    logger('error', e);
    console.error(e);
  }
}
