import { app } from 'electron';
import path from 'path';
import { getValidBrowsers } from '@ocsjs/common';
import { UserScripts } from '../types';

export const appStore = {
  name: app.getName(),
  version: app.getVersion(),
  'user-data-path': app.getPath('userData'),
  'exe-path': app.getPath('exe'),
  'logs-path': app.getPath('logs'),
  'config-path': path.resolve(app.getPath('userData'), './config.json'),
  workspace: path.resolve(app.getPath('userData'), './workspace'),
  'auto-launch': false,
  alwaysOnTop: false,
  notify: [] as any[],
  /** 脚本启动设置 */
  script: {} as any,
  /** 脚本默认设置 */
  setting: {
    answererWrappers: []
  },
  /** 用户脚本列表 */
  userScripts: [] as UserScripts[],
  /** 可以浏览器 */
  validBrowsers: getValidBrowsers()
};
