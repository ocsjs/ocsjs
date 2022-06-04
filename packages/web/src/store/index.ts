
import { reactive, watch } from 'vue';
import { fs, showFile } from '../components/file/File';
import { Project } from '../components/project';
import { remote } from '../utils/remote';
import { FileNode } from './../components/file/File';
import defaultsDeep from 'lodash/defaultsDeep';
import { AppStore, UserScripts } from '@ocsjs/app';
import { CommonUserScript } from '../types/user.script';

const Store = require('electron-store') as typeof import('electron-store');
const { getValidBrowsers } = require('@ocsjs/common') as typeof import('@ocsjs/common');

const s = new Store();

/** 工作区数据 */
export const workspace = reactive<{
  projects: Project[],
  opened: FileNode[],

}>({
  projects: [],
  /** 打开的文件 */
  opened: []
});

export type StoreUserScript = { info: CommonUserScript } & Omit<UserScripts, 'info'>

export const store = reactive<AppStore & {
  files: string[],
  win: {
    size: number
  },
  userScripts: StoreUserScript[]
}>(defaultsDeep(s.store, {
  name: 'ocs',
  version: '0.0.1',
  // 工作路径
  workspace: '',
  'config-path': '',
  'user-data-path': '',
  'exe-path': '',
  'logs-path': '',
  path: '',
  /** 开机自启 */
  'auto-launch': false,
  /** 文件编辑 */
  files: [],
  /** win setting */
  win: {
    size: 1
  },
  /** 用戶脚本 */
  userScripts: [],
  /** 启动浏览器脚本设置 */
  script: {
    /** 是否使用 --user-data-dir (false 为无痕浏览) */
    userDataDir: false,
    launchOptions: {
      headless: false
    }
  },
  /** 浏览器脚本默认设置 */
  setting: {
    /** 题库配置 */
    answererWrappers: []
  },
  alwaysOnTop: false,
  /** 列表展开的 key */
  expandedKeys: [],
  notify: [],
  validBrowsers: getValidBrowsers()
} as AppStore));

watch(store, (newStore) => {
  s.store = JSON.parse(JSON.stringify(newStore));
});

watch(() => store['auto-launch'], setAutoLaunch);
watch(() => store.win.size, setZoomFactor);

/** 监听打开的文件，保留工作区打开的文件 */
watch(
  () => workspace.opened.length,
  () => {
    store.files = workspace.opened.map((file) => file.path);
  }
);

export function setAutoLaunch() {
  remote.methods.call('autoLaunch');
}

export function setZoomFactor() {
  remote.webContents.call('setZoomFactor', store.win.size);
}

export function handleFile(file: string) {
  if (fs.existsSync(String(file))) {
    workspace.opened.push(Project.createFileNode(String(file)));

    // 显示文件
    const len = workspace.opened.length;
    if (len) {
      showFile(workspace.opened[len - 1]);
    }
  }
}

/**
 * 处理打开的文件
 */
export function initOpenFiles() {
  store.files = Array.from(new Set(store.files));
  for (const file of store.files) {
    handleFile(String(file));
  }
}
