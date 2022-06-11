import defaultsDeep from 'lodash/defaultsDeep';
import { reactive } from 'vue';
import { createReactive } from './core/reactive';
import { OCSLocalStorage, OCSStore } from './core/types';
import { isInBrowser } from './core/utils';
import { defaultOCSSetting } from './scripts';

/**
 * OCS 响应式存储对象, 在除油猴环境下的其他环境为 `{}`
 */
let store: OCSStore;

// 环境检测
if (isInBrowser()) {
  // 创建响应式存储对象
  store = reactive(createStore());
  // 初始化本地
  if (top === self) {
    // eslint-disable-next-line no-undef
    GM_setValue('store', JSON.parse(JSON.stringify(store.localStorage)));
  }
  // 创建跨域响应式存储功能
  createReactive('store', store.localStorage, (oldValue, newValue) => {
    // console.log('store changed', oldValue, newValue);
  });
} else {
  store = {} as any;
}

export function getStore() {
  return store;
}

export function createStore(): OCSStore {
  /** 默认存储数据 */
  // eslint-disable-next-line no-undef
  const localStore: OCSLocalStorage = defaultsDeep(isInBrowser() ? GM_getValue('store', {}) : {}, {
    setting: defaultOCSSetting,
    logs: [],
    alerts: [],
    workResults: [],
    /** 是否缩小隐藏面板 */
    hide: false,
    /** 面板位置 */
    position: {
      x: 0,
      y: 0
    }
  } as Partial<OCSLocalStorage>);

  return {
    localStorage: localStore,
    // @ts-ignore
    VERSION: process.env._VERSION_,
    setting: localStore.setting,
    context: {
      common: {
        startOptions: {},
        currentMedia: null
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
  };
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
