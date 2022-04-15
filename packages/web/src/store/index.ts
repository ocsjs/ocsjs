import { LaunchOptions } from 'playwright';
import { reactive, watch } from 'vue';
import { fs, showFile } from '../components/file/File';
import { Project } from '../components/project';
import { remote } from '../utils/remote';
const { ipcRenderer } = require('electron');
const Store = require('electron-store');
const { getValidBrowserPaths } = require('@ocsjs/common') as typeof import('@ocsjs/common');

const s = new Store();

export const store = reactive({
  name: s.get('name'),
  version: s.get('version'),
  workspace: s.get('workspace'),
  'config-path': s.get('config-path'),
  'user-data-path': s.get('user-data-path'),
  'exe-path': s.get('exe-path'),
  'logs-path': s.get('logs-path'),
  path: s.get('path'),
  /** 开机自启 */
  'auto-launch': s.get('auto-launch'),
  /** 文件编辑 */
  files: Array.from(s.get('files') || []),

  /** win setting */
  win: {
    /** 窗口大小 */
    size: s.get('win')?.size || 1.0
  },
  /** 服务器 */
  server: {
    port: s.get('server')?.port
  },
  /** 脚本默认设置 */
  script: {
    /** 是否使用 --user-data-dir (false 为无痕浏览) */
    userDataDir: s.get('script')?.userDataDir || false,
    launchOptions:
      s.get('script')?.launchOptions ||
      ({
        headless: false
      } as LaunchOptions),
    localStorage: s.get('script')?.localStorage || {
      setting: {}
    }
  },
  /** 列表展开的 key */
  expandedKeys: s.get('expandedKeys') || [],
  notify: s.get('notify') || [],
  validBrowserPaths: (s.get('validBrowserPaths') as ReturnType<typeof getValidBrowserPaths>) || getValidBrowserPaths()
});

window.addEventListener('load', () => {
  setTimeout(() => {
    remote.logger.call('info', 'render store init');

    setZoomFactor();
    autoLaunch();
    initOpenFiles();
  }, 1000);
});

ipcRenderer.on('open-file', (e, file) => {
  handleFile(file);
});

watch(store, (newStore) => {
  s.store = JSON.parse(JSON.stringify(newStore));
});

watch(() => store['auto-launch'], autoLaunch);
watch(() => store.win.size, setZoomFactor);

/** 监听打开的文件，保留工作区打开的文件 */
watch(
  () => Project.opened.value.length,
  () => {
    store.files = Project.opened.value.map((file) => file.path);
  }
);

function autoLaunch () {
  remote.methods.call('autoLaunch');
}

function setZoomFactor () {
  remote.webContents.call('setZoomFactor', store.win.size);
}

function handleFile (file: string) {
  if (fs.existsSync(String(file))) {
    Project.opened.value.push(Project.createFileNode(String(file)));

    // 显示文件
    const len = Project.opened.value.length;
    if (len) {
      showFile(Project.opened.value[len - 1]);
    }
  }
}

/**
 * 处理打开的文件
 */
function initOpenFiles () {
  store.files = Array.from(new Set(store.files));
  for (const file of store.files) {
    handleFile(String(file));
  }
}
