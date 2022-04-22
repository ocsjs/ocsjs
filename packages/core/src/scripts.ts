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
  Pick<WorkOptions<any>, 'period' | 'timeout' | 'retry'> & { upload: string }
  exam: Record<string, any> &
  Pick<WorkOptions<any>, 'period' | 'timeout' | 'retry'> & { upload: string }
}

export type SupportPlatform = 'zhs' | 'cx'

export type ScriptSettings = Record<SupportPlatform, Setting> & {
  answererWrappers: AnswererWrapper[]
}

export const defaultOCSSetting = {
  zhs: defaultSetting(),
  cx: defaultSetting(),
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
      upload: 'save'
    },
    exam: {
      period: 3,
      timeout: 30,
      retry: 1,
      stopWhenError: false,
      upload: 'save'
    }
  };
}
