import { OCSApi } from '@ocsjs/common';
import { Browser, BrowserContext, BrowserType, chromium, LaunchOptions, Page, webkit } from 'playwright';
import { CX, ZHS } from '.';
import { ScriptFunction, ScriptOptions } from './types';

export { LaunchOptions };

export interface Script {
  name: keyof ScriptOptions
  options: ScriptOptions[keyof ScriptOptions]
}

export interface LaunchScriptsOptions {
  /** 数据缓存文件夹 (如果为空，则进行无痕浏览) */
  userDataDir: string | undefined
  /** 启动参数 */
  launchOptions: LaunchOptions
  /** 脚本列表 */
  scripts: Script[]
  /** 是否等待脚本执行，否：直接返回 browser 和 page 对象 */
  sync?: boolean
  /** 是否初始化油猴脚本 */
  init?: boolean
  /** 注入到 localStorage.OCS 的变量 */
  localStorage: any
}

export const scripts: Record<keyof ScriptOptions, ScriptFunction> = {
  'cx-login-other': CX.otherLogin,
  'cx-login-phone': CX.phoneLogin,
  'cx-login-phone-code': CX.phoneCodeLogin,
  'cx-login-school': CX.schoolLogin,
  'zhs-login-other': ZHS.otherLogin,
  'zhs-login-phone': ZHS.phoneLogin,
  'zhs-login-school': ZHS.schoolLogin
};

export const scriptNames = [
  ['cx-login-other', '超星手动登录'],
  ['cx-login-phone', '超星手机密码登录'],
  ['cx-login-phone-code', '超星手机验证码登录'],
  ['cx-login-school', '超星学校登录'],
  ['zhs-login-other', '智慧树手动登录'],
  ['zhs-login-phone', '智慧树手机登录'],
  ['zhs-login-school', '智慧树学校登录']
];

process.on('unhandledRejection', (e) => {
  console.error('未知错误', e);
});

process.on('uncaughtException', (e) => {
  console.error('未知错误', e);
});

/**
 * 运行脚本
 */
export async function launchScripts({ userDataDir, launchOptions, scripts, sync = true, init }: LaunchScriptsOptions) {
  let browser: BrowserContext;
  let target: BrowserType;

  /** 确定浏览器类型 */
  if (launchOptions.executablePath?.includes('Firefox')) {
    throw new Error('暂不支持 firefox 浏览器，请切换其他浏览器重试。');
  } else if (launchOptions.executablePath?.includes('Safari')) {
    target = webkit;
  } else {
    target = chromium;
  }

  if (userDataDir) {
    browser = await target.launchPersistentContext(userDataDir, {
      viewport: null,
      ignoreHTTPSErrors: true,
      ...launchOptions
    });
  } else {
    throw new Error('传入的数据文件夹为空');
  }
  let [page] = browser.pages();

  if (init) {
    try {
      console.log('正在更新脚本...');
      await initScript(browser);
      console.log('脚本更新完毕');
    } catch (e) {
      console.log('自动更新脚本失败，请手动更新，或者忽略。', (e as any)?.message);
    }
  }

  if (sync) {
    for (const item of scripts) {
      page = await script(item.name, item.options)(page);
    }
  } else {
    run();
    async function run() {
      const item = scripts.shift();
      if (item) page = await script(item.name, item.options)(page);
      run();
    }
  }

  await page.bringToFront();

  return {
    browser,
    page
  };
}
export function script<T extends keyof ScriptOptions>(name: T, options: ScriptOptions[T]) {
  return function (page: Page) {
    return scripts[name](page, options);
  };
}

/**
 * 安装 ocs 脚本
 *
 */
async function initScript(browser: Browser | BrowserContext) {
  /** 获取最新资源信息 */
  const infos = await OCSApi.getInfos();

  const page = await browser.newPage();

  await page.waitForTimeout(2000);

  const [installPage] = await Promise.all([
    page.context().waitForEvent('page'),
    // @ts-ignore
    page.evaluate((userjs: string) => window.location.replace(userjs), infos.resource.userjs)
  ]);

  console.log('载入脚本', infos.resource.userjs);

  await installPage.waitForTimeout(2000);
  await installPage.click('.ask_action_buttons > input');
  await page.close();
  await installPage.close();
}
