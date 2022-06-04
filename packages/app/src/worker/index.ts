import { BrowserContext, Page } from 'playwright';
import { launchScripts, LaunchScriptsOptions } from '@ocsjs/scripts';
import EventEmitter from 'events';
import path from 'path';
import { Instance as Chalk } from 'chalk';
import { LoggerCore } from '../logger.core';
import { ScriptWorkerAction, ScriptWorkerActions } from './types';
const { bgRedBright, bgBlueBright, bgYellowBright, bgGray } = new Chalk({ level: 2 });

/** 动作集合 */
const actions: Map<keyof ScriptWorkerActions, ScriptWorkerAction> = new Map();

/** 脚本工作线程 */
export class ScriptWorker extends EventEmitter {
  browser?: BrowserContext
  page?: Page
  logger?: LoggerCore
  /** 拓展路径 */
  extensionPath: string = path.resolve('./extensions/Tampermonkey')
  /**
   * 可关闭的页面
   * 在启动程序完成后会处理多余的可关闭页面
   */
  closeablePages: string[] = ['tampermonkey.net/index.php']

  constructor() {
    super();
    process.on('unhandledRejection', (e) => this.error('未处理的错误!', e));
    process.on('uncaughtException', (e) => this.error('未处理的错误!', e));
  }

  /** 任务调度 */
  dispatch(actionName: keyof ScriptWorkerActions, data: any) {
    actions.get(actionName)?.target.call(this, data);
  }

  @Action('launch', {
    name: '启动',
    destroyWhenError: true,
    enableLogger: true
  })
  async launch(options: LaunchScriptsOptions) {
    /** 加载油猴 */
    options.launchOptions.args =
      [`--disable-extensions-except=${this.extensionPath}`, `--load-extension="${this.extensionPath}"`];

    /** 启动脚本 */
    await launchScripts({
      onLaunch: (...args) => {
        // 初始化浏览器变量
        [this.browser, this.page] = args;
        // 开始记录图像
        this.screenshot(this.browser);
      },
      onError: this.error,
      ...options
    });

    if (this.browser === undefined || this.page === undefined || this.page?.isClosed()) {
      throw new Error('启动失败，请重试。');
    } else {
      // 置顶页面
      await this.page.bringToFront();
      // 处理多余页面
      await this.handleCloseablePage(this.browser);
    }
  }

  @Action('close', {
    name: '关闭'
  })
  close() {
    this.destroy();
  }

  screenshot(browser: BrowserContext) {
    const interval = setInterval(async () => {
      const screenshots = await Promise.all(browser.pages().map(async (page) => {
        try {
          const buffer = await page.screenshot();
          return { title: await page.title(), url: page.url(), base64: buffer.toString('base64') };
        } catch {
          return undefined;
        }
      }));
      this.emit('screenshot', screenshots.filter(s => s));
    }, 1000 * 3);
    browser.once('close', () => clearInterval(interval));
  }

  destroy() {
    this.browser?.close();
    this.browser = undefined;
    this.page = undefined;
  }

  /** 处理多余页面 */
  async handleCloseablePage(browser: BrowserContext) {
    for (const page of browser.pages()) {
      if (this.closeablePages.some(cp => page.url().includes(cp))) {
        await page.close();
      }
    }
  }

  debug(...msg: any[]) {
    console.log(bgGray(loggerPrefix()), ...msg);
  }

  warn(...msg: any[]) {
    console.log(bgYellowBright(loggerPrefix()), ...msg);
  }

  info(...msg: any[]) {
    console.log(bgBlueBright(loggerPrefix()), ...msg);
  }

  error(...msg: any[]) {
    console.log(bgRedBright(loggerPrefix()), ...msg);
  }
}

function Action(actionName: keyof ScriptWorkerActions, action: Omit<ScriptWorkerAction, 'target'>): MethodDecorator {
  return (
    target: any,
    key: any,
    descriptor: TypedPropertyDescriptor<any>
  ) => {
    // @ts-ignore
    const original: Function = descriptor.value;
    // @ts-ignore
    descriptor.value = async function (opts: string) {
      try {
        target.info(`${action.name}任务开始`);
        await original.call(this, opts ? JSON.parse(opts) : undefined);
        target.info(`${action.name}任务完成`);
      } catch (err) {
        // @ts-ignore
        target.error(`${action.name}任务错误：${err}`);
        if (action.destroyWhenError) {
          target.destroy.call(this);
        }
      }
    };

    actions.set(actionName, {
      // @ts-ignore
      target: descriptor.value,
      ...action
    });
  };
}

function loggerPrefix() {
  return `[OCS] ${new Date().toLocaleTimeString()}`;
}
