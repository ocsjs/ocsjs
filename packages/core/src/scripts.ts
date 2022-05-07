import { AnswererWrapper } from './core/worker/answer.wrapper.handler';
import { WorkOptions } from './core/worker/interface';

export interface Setting {
  video: {
    [x: string]: any
    watchTime: number
    playbackRate: number
    /** 音量 */
    volume: number
    restudy: boolean
  }
  work: Record<string, any> &
  Pick<WorkOptions<any>, 'period' | 'timeout' | 'retry'> & { upload: string, waitForCheck: number }
  exam: Record<string, any> &
  Pick<WorkOptions<any>, 'period' | 'timeout' | 'retry'> & { upload: string, waitForCheck: number }
}

export type SupportPlatform = 'zhs' | 'cx' |'icve'

export type ScriptSettings = Record<SupportPlatform, Setting> & {
  answererWrappers: AnswererWrapper[]
}

export const defaultOCSSetting = {
  zhs: defaultSetting(),
  cx: defaultSetting(),
  icve: defaultSetting(),
  answererWrappers: [] as AnswererWrapper[]
};

/**
 * 默认设置
 */
export function defaultSetting(): Setting {
  return {
    video: {
      watchTime: 0,
      playbackRate: 1,
      restudy: false,
      volume: 0,
      upload: 'close'
    },
    work: {
      period: 3,
      timeout: 30,
      retry: 1,
      stopWhenError: false,
      upload: 'save',
      waitForCheck: 5
    },
    exam: {
      period: 3,
      timeout: 30,
      retry: 1,
      stopWhenError: false,
      upload: 'save',
      waitForCheck: 5
    }
  };
}
