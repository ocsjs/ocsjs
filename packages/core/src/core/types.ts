import { AlertType } from '../components/alert';
import { ScriptSettings } from '../scripts';
import { StartOptions } from '../start';
import { WorkResult } from './worker/interface';

/**
 * OCS 本地存储类型
 */
export interface OCSLocalStorage {
  [x: string]: any
  /** 网课平台类型 */
  platform?: string
  /** 本地设置 */
  setting: ScriptSettings
  /** 面板是否隐藏 */
  hide: boolean
  /** 面板位置 */
  position: { x: number; y: number }
  /** 日志存储 */
  logs: {
    time: number
    level: string
    extra: string
    text: string
  }[]

}

export interface OCSStore {
  localStorage: OCSLocalStorage
  /** 版本号 */
  VERSION: string
  setting: ScriptSettings
  context: {
    common: {
      /** 当前视频 */
      currentMedia: HTMLMediaElement | null
      /** 搜索结果存储 */
      workResults: WorkResult<any>[]
      /** 启动参数 */
      startOptions: StartOptions | undefined
      /** 消息 */
      alerts: AlertType[]
    },
    /**
   * 各脚本预留存储字段
   */
    cx: {
      /** 超星 videojs 元素 */
      videojs: HTMLElement | null
      /** 是否正在识别文字 */
      isRecognizing: boolean
      /**
     * 字体字典库 用于繁体字识别
     * author wyn665817
     * @see https://bbs.tampermonkey.net.cn/thread-2303-1-1.html
     */
      fontMap: any
    },
    zhs: {
      /** 是否正在识别文字 */
      isRecognizing: boolean
    }

  }
}
