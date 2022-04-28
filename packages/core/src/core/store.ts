import { ScriptSettings } from '../scripts';
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
  /** 版本号 */
  VERSION: string
  setting: ScriptSettings
  localStorage: OCSLocalStorage
  /** 当前视频 */
  currentMedia: HTMLMediaElement | null
  /** 超星 videojs 元素 */
  videojs: HTMLElement | null
  /** 搜索结果存储 */
  workResults: WorkResult<any>[]
  /** 是否正在识别文字 */
  isRecognizing: boolean
}
