import { store } from '../../script';
import { DefineScript, GlobPattern, ScriptPanel, ScriptRoute } from '../define.script';

export async function sleep (period: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, period);
  });
}

/** glob 格式进行url匹配 */
export function urlGlob (pattern: string, input = window.location.href) {
  const re = new RegExp(pattern.replace(/([.?+^$[\]\\(){}|/-])/g, '\\$1').replace(/\*/g, '.*'));
  return re.test(input);
}

/**
 * 匹配url
 * @param target 字符串，正则表达式，glob表达式
 */
export function urlMatch (
  target: string | RegExp | GlobPattern | string[] | RegExp[] | GlobPattern[],
  input = window.location.href
) {
  const targetURL = Array.isArray(target) ? target : [target];
  return targetURL.some((target) => (typeof target === 'string' ? urlGlob(target) : target.test(input)));
}

/**
 * 当前的脚本路由
 */
export function getCurrentRoutes (scripts: DefineScript[]): ScriptRoute[] {
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
export function getCurrentPanels (scripts: DefineScript[]) {
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
export function addFunctionEventListener (obj: any, type: string) {
  const origin = obj[type];
  return function () {
    // @ts-ignore
    const res = origin.apply(this, arguments);
    const e = new Event(type.toString());
    // @ts-ignore
    e.arguments = arguments;
    window.dispatchEvent(e);
    return res;
  };
}

/**
 * 获取有效的数字
 * @param nums
 * @returns
 */
export function getNumber (...nums: number[]) {
  return nums.map((num) => (typeof num === 'number' ? num : undefined)).find((num) => num !== undefined);
}

/**
 * 当前是否处于浏览器环境
 */
export function isInBrowser (): boolean {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined';
}

/**
 * 等待文字识别
 */
export function waitForRecognize() {
  return new Promise<void>((resolve) => {
    const timer = setInterval(() => {
      if (store.isRecognizing === false) {
        clearInterval(timer);
        resolve();
      }
    }, 100);
  });
}

/**
 * 显示面板
 */
export function resetPanelPosition(hide?: boolean) {
  // @ts-ignore
  const panel: HTMLElement = top?.document.querySelector('ocs-panel');
  if (panel) {
    if (hide === undefined ? panel.classList.contains('hide') : hide) {
      panel.style.top = 'unset';
      panel.style.bottom = '10%';
      panel.style.left = '5%';
    } else {
      panel.style.top = '20%';
      panel.style.bottom = 'unset';
      panel.style.left = '50%';
    }
  }
}
