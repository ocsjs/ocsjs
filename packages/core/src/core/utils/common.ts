import { store } from '../../script';
import { DefineScript, GlobPattern, ScriptPanel, ScriptRoute } from '../define.script';

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
 * 发起请求
 * @param url 请求地址
 * @param opts 请求参数
 */
export function request(url: string, opts: {
  type: 'fetch' | 'GM_xmlhttpRequest',
  method?: 'get' | 'post';
  headers?: Record<string, string>;
  contentType?: 'json' | 'text',
  body?: string
}): Promise<string | object> {
  return new Promise((resolve, reject) => {
    /** 默认参数 */
    const { contentType = 'json', body, method = 'get', headers = {}, type = 'fetch' } = opts || {};
    /** 环境变量 */
    const env = isInBrowser() ? 'browser' : 'node';

    /** 如果是跨域模式并且是浏览器环境 */
    if (type === 'GM_xmlhttpRequest' && env === 'browser') {
      if (typeof GM_xmlhttpRequest !== 'undefined') {
        // eslint-disable-next-line no-undef
        GM_xmlhttpRequest({
          method: opts.method?.toLocaleUpperCase() as any || 'GET',
          url,
          data: JSON.stringify(body || {}),
          headers: opts.headers || {},
          responseType: 'json',
          onload: (response) => {
            if (contentType === 'json') {
              resolve(JSON.parse(response.responseText));
            } else {
              resolve(response.responseText);
            }
          },
          onerror: reject
        });
      } else {
        reject(new Error('GM_xmlhttpRequest is not defined'));
      }
    } else {
      const fet: (...args: any[]) => Promise<Response> = env === 'node' ? require('node-fetch').default : fetch;
      fet(url, { contentType, body, method, headers }).then(async (response) => {
        if (contentType === 'json') {
          resolve(await response.json());
        } else {
          resolve(await response.text());
        }
      }).catch((error) => {
        reject(new Error(error));
      });
    }
  });
}
