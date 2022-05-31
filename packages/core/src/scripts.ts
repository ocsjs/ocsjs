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
  study: {
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
  },
  // 历史遗留字段
  video: undefined;
  /** 直播回放课 */
  live: {
    /** 播放速度 */
    playbackRate: number
    /** 显示视频进度 */
    showProgress: boolean
    /** 音量 */
    volume: number
  },
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

type ICVECell = {
  /** 是否为学习任务 */
  isTask: boolean
  /** 链接 */
  href: string
  Id: string
  categoryName: '视频' | 'ppt'
  cellName: string
  stuCellPercent: number
}

export interface ICVESetting {
  study: {
    /** 播放速度 */
    playbackRate: number
    /** 音量 */
    volume: number
    /** 显示视频进度 */
    showProgress: boolean
    /** ppt翻阅速度 */
    pptRate: number
    /** 是否正在学习中 */
    isStarting: boolean
    /** 当前任务 */
    currentTask: ICVECell | undefined
    /** 任务章节 */
    cells: ICVECell[]
  }
}

export interface ScriptSettings {
  zhs: ZHSSetting
  cx: CXSetting
  icve: ICVESetting
  common: {
    answererWrappers: AnswererWrapper[]
  }
  // 历史遗留字段
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
    study: {
      playbackRate: 1,
      showProgress: true,
      restudy: false,
      volume: 0,
      upload: 'close',
      playlines: ['默认路线', '公网1', '公网2'],
      line: '默认路线',
      forceWork: false,
      randomWork: {
        enable: false,
        choice: false,
        complete: false,
        completeTexts: ['不会', '不知道', '不清楚', '不懂', '不会写']
      }
    },
    video: undefined,
    live: {
      playbackRate: 1,
      showProgress: true,
      volume: 1
    },
    work: defaultWorkSetting,
    exam: defaultWorkSetting
  },
  icve: {
    study: {
      playbackRate: 1,
      volume: 0,
      showProgress: true,
      pptRate: 5,
      isStarting: false,
      currentTask: undefined,
      cells: []
    }
  },
  common: {
    answererWrappers: [] as AnswererWrapper[]
  },
  // 历史遗留字段
  answererWrappers: [] as AnswererWrapper[]
};
