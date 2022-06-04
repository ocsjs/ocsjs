import { ipcMain, app, dialog, BrowserWindow } from 'electron';
import { Logger } from '../logger';
import trash from 'trash';
import { autoLaunch } from './auto.launch';
import axios from 'axios';

/**
 * 注册主进程远程通信事件
 * @param name 事件前缀名称
 * @param target 事件目标
 */
function registerRemoteEvent(name: string, target: any) {
  const logger = Logger('remote');
  ipcMain
    .on(name + '-get', (event, args) => {
      try {
        logger.info({ event: name + '-get', args });
        const property = args[0];
        event.returnValue = target[property];
      } catch (e) {
        event.returnValue = { error: e };
      }
    })
    .on(name + '-set', (event, args) => {
      try {
        logger.info({ event: name + '-set', args });
        const [property, value] = [args[0], args[1]];
        event.returnValue = target[property] = value;
      } catch (e) {
        event.returnValue = { error: e };
      }
    })

    .on(name + '-call', async (event, args) => {
      const [channel, property, ...value] = [args.shift(), args.shift(), ...args];
      logger.info({ event: name + '-call', args });
      try {
        const result = await target[property](...value);
        event.reply(channel, { data: result });
      } catch (e) {
        event.reply(channel, { error: e });
      }
    });
}

/**
 * 初始化远程通信
 */
export function remoteRegister(win: BrowserWindow) {
  registerRemoteEvent('win', win);
  registerRemoteEvent('webContents', win.webContents);
  registerRemoteEvent('app', app);
  registerRemoteEvent('dialog', dialog);
  registerRemoteEvent('methods', {
    autoLaunch,
    trash,
    get: (url: string, opts: any) => (axios.get(url, opts).then(res => res.data)),
    post: (url: string, opts: any) => (axios.post(url, opts).then(res => res.data))
  });
  registerRemoteEvent('logger', Logger('render'));
}

export interface RemoteMethods {
  autoLaunch: typeof autoLaunch;
  trash: typeof trash;
  get: typeof axios.get;
  post: typeof axios.post;
}

const _registerRemoteEvent = registerRemoteEvent;
export { _registerRemoteEvent as registerRemoteEvent };
