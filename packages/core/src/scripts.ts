import { AnswererWrapper } from './core/worker/answer.wrapper.handler';
import { WorkOptions } from './core/worker/interface';

export type CommonWorkSetting = Pick<WorkOptions<any>, 'period' | 'timeout' | 'retry' | 'stopWhenError'> & {
  /** 提交模式 */
  upload: string,
  /** 答题后等待的时间 */
  waitForCheck: number,
}

/**
 * 超星设置
 */
export interface CXSetting {
  common: {
    /** 繁体字识别 */
    recognize: 'map' | 'ocr' | 'close'
  },
  video: {
    /** 播放速度 */
    playbackRate: number
    /** 显示视频进度 */
    showProgress: boolean
    /** 音量 */
    volume: number
    /** 复习模式 */
    restudy: boolean,
    /** 章节测试自动答题 */
    upload: string
    /** 播放路线列表 */
    playlines: string[]
    /** 播放路线 */
    line: string
    /** 强制答题 */
    forceWork: boolean,
    /** 随机作答 */
    randomWork: {
      /** 是否开启 */
      enable: boolean,
      /** 选择随机 */
      choice: boolean
      /** 填空随机 */
      complete: boolean
      /** 填空随机文案 */
      completeTexts: string[]
    },
  }
  work: CommonWorkSetting
  exam: CommonWorkSetting
}

/**
 * 智慧树设置
 */
export interface ZHSSetting {
  video: {
    /** 观看时间 */
    watchTime: number
    /** 观看计时器 */
    interval: any
    /** 关闭时间 */
    closeDate: Date
    /** 播放速度 */
    playbackRate: number
    /** 显示视频进度 */
    showProgress: boolean
    /** 音量 */
    volume: number
    /** 复习模式 */
    restudy: boolean,
    /** 学分课学习模式 */
    creditStudy: boolean
  }
  work: CommonWorkSetting
  exam: CommonWorkSetting
}

export interface ScriptSettings {
  zhs: ZHSSetting
  cx: CXSetting
  icve: any
  answererWrappers: AnswererWrapper[]
}

/**
 * 默认自动答题设置
 */
export const defaultWorkSetting: CommonWorkSetting = {
  /** 答题间隔时间 */
  period: 3,
  /** 答题请求超时时间 */
  timeout: 30,
  /** 请求重试次数 */
  retry: 1,
  /** 当错误时停止答题 */
  stopWhenError: false,
  /** 提交模式 */
  upload: 'save',
  /** 答题完成后延迟时间 */
  waitForCheck: 5
};

export const defaultOCSSetting: ScriptSettings = {
  zhs: {
    video: {
      watchTime: 0,
      interval: undefined,
      closeDate: new Date(0),
      playbackRate: 1,
      showProgress: true,
      restudy: false,
      volume: 0,
      creditStudy: false
    },
    work: defaultWorkSetting,
    exam: defaultWorkSetting
  },
  cx: {
    common: {
      recognize: 'map'
    },
    video: {
      playbackRate: 1,
      showProgress: true,
      restudy: false,
      volume: 0,
      upload: 'close',
      playlines: ['公网1', '公网2'],
      line: '公网1',
      forceWork: false,
      randomWork: {
        enable: false,
        choice: false,
        complete: false,
        completeTexts: ['不会', '不知道', '不清楚', '不懂', '不会写']
      }
    },
    work: defaultWorkSetting,
    exam: defaultWorkSetting
  },
  icve: {},
  answererWrappers: [] as AnswererWrapper[]
};
