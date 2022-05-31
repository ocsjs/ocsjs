import defaultsDeep from 'lodash/defaultsDeep';
import { reactive, watch } from 'vue';
import { OCSLocalStorage, OCSStore } from './core/types';
import { isInBrowser, onComplete, useUnsafeWindow } from './core/utils';
import { logger } from './logger';
import { defaultOCSSetting } from './scripts';

/**
 * OCS 响应式存储对象, 在除油猴环境下的其他环境为 `{}`
 */
let store: OCSStore = {} as OCSStore;

// 环境检测
if (isInBrowser()) {
  if (typeof useUnsafeWindow() !== 'undefined') {
    setStore(createStore());
  }
}

export function getStore() {
  return store;
}

export function setStore(val: OCSStore) {
  store = val;
}

export function createStore() {
  /** 默认存储数据 */
  // eslint-disable-next-line no-undef
  const defaultStore = defaultsDeep(isInBrowser() ? GM_getValue('store', {}) : {}, {
    logs: [],
    workResults: [],
    /** 是否缩小隐藏面板 */
    hide: false,
    /** 面板位置 */
    position: {
      x: 0,
      y: 0
    }
  } as Partial<OCSLocalStorage>);

  /** 本地存储数据 */
  const _localStorage: OCSLocalStorage = reactive<OCSLocalStorage>({
    setting: defaultsDeep(defaultStore.setting, defaultOCSSetting),
    ...defaultStore
  });

  // 响应式对象
  const _store = reactive<OCSStore>({
    localStorage: _localStorage,
    // @ts-ignore
    VERSION: process.env._VERSION_,
    setting: _localStorage.setting,
    context: {
      common: {
        startOptions: {},
        currentMedia: null,
        workResults: [],
        alerts: []
      },
      cx: {
        videojs: null,
        isRecognizing: false,
        fontMap: {}
      },
      zhs: {
        isRecognizing: false
      }
    }
  });

  /** 监听，并保存到本地 */
  watch(_localStorage, () => {
    // eslint-disable-next-line no-undef
    GM_setValue('store', JSON.parse(JSON.stringify(_localStorage)));
  });

  return _store;
}

export function initStore(original: OCSStore) {
  onComplete(() => {
    if (typeof useUnsafeWindow() !== 'undefined') {
      try {
        // 统一转向顶层对象
        // eslint-disable-next-line no-undef
        setStore(original || store);
      } catch (e) {
        // @ts-ignore
        console.log('store init error', e.message);
      }
    } else {
      logger('warn', '为了确保功能正常使用, 请在油猴环境下运行 https://www.tampermonkey.net/');
    }
  });
}

export function useStore<T extends keyof OCSStore>(name: T): OCSStore[T] {
  return store[name];
}

/**
 * 获取公共上下文
 */
export function useContext() {
  return store.context;
}

/**
 * 获取设置
 */
export function useSettings() {
  // 历史遗留字段处理
  if (store.setting.answererWrappers.length && store.setting.common.answererWrappers.length === 0) {
    store.setting.common.answererWrappers = store.setting.answererWrappers;
    store.setting.answererWrappers = [];
  }
  // 历史遗留字段处理
  if (store.setting.cx.video && store.setting.cx.study === undefined) {
    store.setting.cx.study = store.setting.cx.video;
    store.setting.cx.video = undefined;
  }

  return store.setting;
}
