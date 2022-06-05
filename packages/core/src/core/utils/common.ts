import { useContext } from '../../store';
import { DefineScript, GlobPattern, ScriptPanel, ScriptRoute } from '../define.script';
import { request } from './request';

export async function sleep(period: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, period);
  });
}

/** glob 格式进行url匹配 */
export function urlGlob(pattern: string, input = window.location.href) {
  const re = new RegExp(pattern.replace(/([.?+^$[\]\\(){}|/-])/g, '\\$1').replace(/\*/g, '.*'));
  return re.test(input);
}

/**
 * 匹配url
 * @param target 字符串，正则表达式，glob表达式
 */
export function urlMatch(
  target: string | RegExp | GlobPattern | string[] | RegExp[] | GlobPattern[],
  input = window.location.href
) {
  const targetURL = Array.isArray(target) ? target : [target];
  return targetURL.some((target) => (typeof target === 'string' ? urlGlob(target) : target.test(input)));
}

/**
 * 当前的脚本路由
 */
export function getCurrentRoutes(scripts: DefineScript[]): ScriptRoute[] {
  const routes: ScriptRoute[] = [];
  for (const script of scripts) {
    for (const route of script.routes || []) {
      if (urlMatch(route.url)) {
        routes.push(route);
      }
    }
  }

  return routes;
}

/**
 * 当前面板
 */
export function getCurrentPanels(scripts: DefineScript[]) {
  let panels: Pick<ScriptPanel, 'name' | 'el' | 'default' | 'priority'>[] = [];
  for (const script of scripts) {
    for (const panel of script.panels || []) {
      if (urlMatch(panel.url)) {
        panels.push(panel);

        if (panel.children) {
          panels = panels.concat(panel.children);
        }
      }
    }
  }
  return panels;
}

/**
 * 添加事件调用监听器
 */
export function addFunctionEventListener(obj: any, type: string) {
  const origin = obj[type];
  return function (...args: any[]) {
    // @ts-ignore
    const res = origin.apply(this, args);
    const e = new Event(type.toString());
    // @ts-ignore
    e.arguments = args;
    window.dispatchEvent(e);
    return res;
  };
}

/**
 * 获取有效的数字
 * @param nums
 * @returns
 */
export function getNumber(...nums: number[]) {
  return nums.map((num) => (typeof num === 'number' ? num : undefined)).find((num) => num !== undefined);
}

/**
 * 当前是否处于浏览器环境
 */
export function isInBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined';
}

/**
 * 等待文字识别
 */
export function waitForRecognize(type: 'cx' | 'zhs') {
  return new Promise<void>((resolve) => {
    const timer = setInterval(() => {
      const isRecognizing = type === 'cx' ? useContext().cx.isRecognizing : useContext().zhs.isRecognizing;
      if (isRecognizing === false) {
        clearInterval(timer);
        resolve();
      }
    }, 100);
  });
}

/**
 * 使用 unsafeWindow
 */
export function useUnsafeWindow() {
  // eslint-disable-next-line no-undef
  return typeof unsafeWindow !== 'undefined' ? unsafeWindow : undefined;
}

/**
 * 获取可用设置
 */
export async function getRemoteSetting(port: number) {
  for (let count = 3; count > 0; count--) {
    try {
      return await request(`http://localhost:${port}/setting`, {
        type: 'GM_xmlhttpRequest',
        method: 'get',
        contentType: 'json'
      });
    } catch (err) {
      console.log('获取本地题库配置失败，等待下一次重试。', err);
    }
    await sleep(60 * 1000);
  }
}
