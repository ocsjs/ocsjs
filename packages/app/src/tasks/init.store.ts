// @ts-check

import Store from 'electron-store';
import { existsSync, mkdirSync } from 'fs';
import { appStore } from '../store';

/**
 * 初始化配置
 */
export function initStore() {
  const store = new Store();
  if (!existsSync(appStore.workspace)) {
    mkdirSync(appStore.workspace, { recursive: true });
  }
  if (!store.get('version')) {
    appStore.notify = Array.from(store.get('notify') as any[] || []);
    appStore.script = store.get('script') as any || {
      userDataDir: '',
      launchOptions: {
        headless: false,
        executablePath: ''
      }
    };
    store.store = appStore;
  }
}
