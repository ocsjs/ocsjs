// @ts-check

import Store from 'electron-store';
import { appStore } from '../store';

/**
 * 初始化配置
 */
export function initStore() {
  const store = new Store();
  if (!store.get('version')) {
    appStore.notify = Array.from(store.get('notify') as any[] || []);
    appStore.script = store.get('script') || {};
    store.store = appStore;
  }
}
