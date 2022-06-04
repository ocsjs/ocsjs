import { BrowserContext, BrowserType, chromium, LaunchOptions, Page, webkit } from 'playwright';
import { CX, ZHS } from '.';
import { openLink } from './common';
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
  /** 是否载入本地脚本 */
  init?: boolean
  /** 用户脚本列表 */
  userScripts: { url: string }[]
}

export const scriptNames = [
  ['cx-login-phone', '超星手机密码登录'],
  ['cx-login-phone-code', '超星手机验证码登录'],
  ['cx-login-school', '超星学校登录'],
  ['zhs-login-phone', '智慧树手机登录'],
  ['zhs-login-school', '智慧树学校登录'],
  ['open-diy-link', '进入自定义链接']
];

export const scripts: Record<keyof ScriptOptions, ScriptFunction> = {
  'cx-login-phone': CX.phoneLogin,
  'cx-login-phone-code': CX.phoneCodeLogin,
  'cx-login-school': CX.schoolLogin,
  'zhs-login-phone': ZHS.phoneLogin,
  'zhs-login-school': ZHS.schoolLogin,
  'open-diy-link': openLink
};

process.on('unhandledRejection', (e) => {
  console.error('未知错误', e);
});

process.on('uncaughtException', (e) => {
  console.error('未知错误', e);
});

/**
 * 运行脚本
 */
export async function launchScripts({
  userDataDir,
  launchOptions,
  scripts,
  init,
  userScripts,
  onLaunch,
  onError
}: LaunchScriptsOptions & {
  onLaunch?: (browser: BrowserContext, page: Page) => void,
  onError?: (msg: string) => void
}) {
  let browser: BrowserContext;
  let target: BrowserType;

  /** 确定浏览器类型 */
  if (launchOptions.executablePath?.includes('Firefox')) {
    onError?.('暂不支持 firefox 浏览器，请切换其他浏览器重试。');
    return;
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
    onError?.('传入的数据文件夹为空');
    return;
  }
  let [page] = browser.pages();

  onLaunch?.(browser, page);

  /** 载入本地脚本 */
  if (init) {
    for (const userjs of userScripts) {
      try {
        if (!page.isClosed()) {
          console.log('载入脚本: ' + userjs.url);
          await initScript(userjs.url, page);
        }
      } catch (e) {
        // @ts-ignore
        onError?.('脚本载入失败，请手动更新，或者忽略。' + e.message);
      }
    }
  }
  /** 置顶当前页面 */
  if (!page.isClosed()) await page.bringToFront();
  /** 开始执行文件 */
  for (const item of scripts) {
    try {
      if (!page.isClosed()) {
        page = await script(item.name, item.options)(page);
      }
    } catch (err) {
      // @ts-ignore
      onError?.(item.name + '失败, 请重试。' + err.message);
    }
  }

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
 * 安装/更新脚本
 *
 */
async function initScript(url: string, page: Page) {
  /** 获取最新资源信息 */

  await page.waitForTimeout(3000);

  const [installPage] = await Promise.all([
    page.context().waitForEvent('page'),
    // @ts-ignore
    page.evaluate((url: string) => window.location.replace(url), url)
  ]);

  await installPage.waitForTimeout(3000);
  await installPage.evaluate(() => {
    const input = document.querySelector('input');
    input?.click();
  });
}
