import { App as VueApp, createApp } from 'vue';
import App from './App.vue';
import { DefineScript } from './core/define.script';
import { getCurrentRoutes, onComplete, onInteractive } from './core/utils';
import { logger } from './logger';
import { definedScripts } from './main';
import { useContext, useStore } from './store';
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
export function start(options?: StartOptions) {
  // 执行脚本
  executeScripts(options?.scripts || definedScripts);

  // 加载面板
  if (top === window) {
    const ctx = useContext();
    ctx.common.startOptions = options;

    /** 绑定元素 */
    app = createApp(App);
    const div = document.createElement('div');
    const shadowRoot = div.attachShadow({ mode: 'closed' });
    const style = document.createElement('style');
    panel = document.createElement('div');
    style.innerHTML = options?.style || '';

    onComplete(() => {
      if (!loaded) {
        loaded = true;
        showPanels();
      }
    });
    onInteractive(() => {
      if (!loaded) {
        loaded = true;
        showPanels();
      }
    });

    function showPanels() {
      shadowRoot.appendChild(style);
      shadowRoot.appendChild(panel!);
      document.body.appendChild(div);
      app.mount(panel);
      logger('info', `OCS ${useStore('VERSION')} 加载成功`);
    }
    });
  }
}

/**
 * 执行脚本
 */
export function executeScripts(scripts: DefineScript[]) {
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

    function load() {
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
