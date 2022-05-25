import { domSearch, domSearchAll, getNumber, searchIFrame, sleep, StringUtils, waitForRecognize } from '../../core/utils';
import { OCSWorker } from '../../core/worker';
import { defaultAnswerWrapperHandler } from '../../core/worker/answer.wrapper.handler';
import { logger } from '../../logger';
import { ScriptSettings } from '../../scripts';

import { message } from '../../components/utils';
import { store } from '../../store';
import CXAnalyses from './utils';

/**
 * cx 任务学习
 */
export async function study(setting: ScriptSettings['cx']['video']) {
  logger('debug', '即将开始');

  const tasks = searchTask(setting);

  for (const task of tasks) {
    try {
      await sleep(3000);
      await task();
    } catch (e) {
      logger('error', '未知错误:', e);
    }
  }

  // 下一章按钮
  const { next } = domSearch({ next: '.next[onclick^="PCount.next"]' }, top?.document);

  // 如果按钮显示
  if (next !== null && next.style.display === 'block') {
    // 如果即将切换到下一章节
    if (CXAnalyses.isInFinalTab()) {
      if (CXAnalyses.isStuckInBreakingMode()) {
        message('warn', '检测到此章节重复进入, 为了避免无限重复, 请自行手动完成后手动点击下一章, 或者刷新重试。');
        return;
      }
    }

    logger('debug', '完成, 即将跳转, 如卡死请自行点击下一章。');
    await sleep(3000);
    next.click();
  } else {
    if (CXAnalyses.isInFinalChapter()) {
      if (CXAnalyses.isFinishedAllChapters()) {
        message('success', '全部任务点已完成！');
      } else {
        message('warn', '已经抵达最后一个章节！但仍然有任务点未完成，请手动切换至未完成的章节。');
      }
    } else {
      message('error', '下一章按钮不存在，请尝试刷新或者手动切换下一章。');
    }
  }
}

/**
 * 搜索任务点
 */
function searchTask(setting: ScriptSettings['cx']['video']): (() => Promise<void> | undefined)[] {
  return searchIFrame(document)
    .map((frame) => {
      const { media, read, chapterTest } = domSearch(
        {
          media: 'video,audio',
          chapterTest: '.TiMu',
          read: '#img.imglook'
        },
        frame.contentDocument || document
      );

      function getJob() {
        return media
          ? mediaTask(setting, media as any, frame)
          : read
            ? readTask(frame)
            : chapterTest
              ? chapterTestTask(store.setting.cx.work, frame)
              : undefined;
      }
      if (media || read || chapterTest) {
        return () => {
          // @ts-ignore
          let _parent = frame.contentWindow;
          // @ts-ignore
          let jobIndex = getNumber(frame.contentWindow?._jobindex, _parent._jobindex);

          while (_parent) {
            // @ts-ignore
            jobIndex = getNumber(jobIndex, frame.contentWindow?._jobindex, _parent._jobindex);
            // @ts-ignore
            const attachments = _parent?.JC?.attachments || _parent.attachments;

            if (attachments && typeof jobIndex === 'number') {
              const { name, title, bookname, author } = attachments[jobIndex]?.property || {};
              const jobName = name || title || (bookname ? bookname + author : undefined) || '未知任务';

              // 直接重复学习，不执行任何判断, 章节测试除外
              if (setting.restudy && !chapterTest) {
                logger('debug', jobName, '即将重新学习。');
                return getJob();
              } else if (attachments[jobIndex]?.job === true) {
                logger('debug', jobName, '即将开始。');
                return getJob();
              } else if (chapterTest && setting.forceWork) {
                logger('debug', jobName, '开启强制答题。');
                return getJob();
              } else {
                logger('debug', jobName, '已经完成，即将跳过。');
                break;
              }
            }
            // @ts-ignore
            if (_parent.parent === _parent) {
              break;
            }
            // @ts-ignore
            _parent = _parent.parent;
          }
        };
      } else {
        return undefined;
      }
    })
    .filter((f) => f) as any[];
}

/**
 * 永久固定显示视频进度
 */
export function fixedVideoProgress(fixed: boolean) {
  const videojs = store.videojs;

  if (videojs) {
    const { bar } = domSearch({ bar: '.vjs-control-bar' }, videojs);
    if (bar) {
      console.log('fixedVideoProgress', { bar, fixed });
      bar.style.opacity = fixed ? '1' : '0';
    }
  }
}

/**
 *  视频路线切换
 */
export function switchPlayLine(
  setting: ScriptSettings['cx']['video'],
  videojs: HTMLElement,
  media: HTMLMediaElement,
  line: string
) {
  if (setting.line === '默认路线') {
    logger('debug', '当前播放路线为: 默认路线，如觉得视频卡顿，请尝试切换其他路线。');
  } else {
    const { playbackRate = 1 } = setting;

    // @ts-ignore
    if (videojs?.player) {
      // @ts-ignore  播放路线列表
      const playlines: { label: string }[] = Array.from(videojs.player.controlBar.options_.playerOptions.playlines);
      // 播放菜单元素
      const menus: HTMLElement[] = Array.from(
        // @ts-ignore
        videojs.player.controlBar.videoJsPlayLine.querySelectorAll('ul li')
      );

      setting.playlines = ['默认路线'].concat(playlines.map(line => line.label));

      logger('debug', '切换路线中： ' + line);
      selectLine(line);

      function selectLine(line: string) {
        for (const menu of menus) {
          if (menu.textContent?.includes(line)) {
            menu.click();
            setting.line = line;
            /** 重新选择倍速 */
            setTimeout(() => (media.playbackRate = playbackRate), 3000);
            break;
          }
        }
      }
    }
  }
}

/**
 * 播放视频和音频
 */
function mediaTask(setting: ScriptSettings['cx']['video'], media: HTMLMediaElement, frame: HTMLIFrameElement) {
  const { playbackRate = 1, volume = 0 } = setting;

  // @ts-ignore
  const { videojs } = domSearch({ videojs: '#video' }, frame.contentDocument || document);

  if (!videojs) {
    message('error', '视频检测不到，请尝试刷新或者手动切换下一章。');
    return;
  }

  store.videojs = videojs;
  store.currentMedia = media;

  if (videojs && setting.line) {
    // 切换路线
    setTimeout(() => switchPlayLine(setting, videojs, media, setting.line), 3000);
  }

  // 是否固定视频进度
  fixedVideoProgress(setting.showProgress);

  /**
   * 视频播放
   */
  return new Promise<void>((resolve) => {
    if (media) {
      media.volume = volume;
      media.play();
      media.playbackRate = playbackRate;

      async function playFunction() {
        // @ts-ignore
        if (!media.ended && !media.__played__) {
          const { tkTopics, opts, submit } = domSearchAll({
            tkTopics: '.tkTopic',
            opts: '.ans-videoquiz-opt input',
            submit: '#videoquiz-submit'
          }, videojs || document);

          // 判断是否存在答题弹窗
          if (tkTopics.length) {
            logger('debug', '视频答题启动');
            await sleep(1000);
            for (const opt of opts) {
              // @ts-ignore
              if (!opt.checked && !opt._checked) {
                opt.click();
                // @ts-ignore
                opt._checked = true;
                break;
              }
            }
            await sleep(1000);
            // 提交
            submit[0].click();

            await sleep(3000);
            // 继续检测
            await playFunction();
          } else {
            // 重新播放
            await sleep(1000);
            media.play();
          }
        } else {
          // @ts-ignore
          media.__played__ = true;
          logger('info', '视频播放完毕');
          // @ts-ignore
          media.removeEventListener('pause', playFunction);
        }
      }

      media.addEventListener('pause', playFunction);

      media.addEventListener('ended', () => resolve());
    }
  });
}

/**
 * 阅读 ppt
 */
async function readTask(frame?: HTMLIFrameElement) {
  // @ts-ignore
  const finishJob = frame?.contentWindow?.finishJob;
  if (finishJob) finishJob();
  await sleep(3000);
}

/**
 * 章节测验
 */
async function chapterTestTask(setting: ScriptSettings['cx']['work'], frame: HTMLIFrameElement) {
  const { period, timeout, retry } = setting;

  if (store.setting.cx.video.upload === 'close') {
    logger('warn', '自动答题已被关闭！');
  } else if (store.setting.answererWrappers.length === 0) {
    logger('warn', '题库配置为空，请设置。');
    // @ts-ignore
  } else if (!frame.contentWindow) {
    logger('warn', '元素不可访问');
  } else {
    logger('info', '开始自动答题');

    // 等待文字识别
    await waitForRecognize();

    const { window: frameWindow } = frame.contentWindow;

    const { TiMu } = domSearchAll({ TiMu: '.TiMu' }, frameWindow.document);
    /** 清空答案 */
    store.workResults = [];

    /** 新建答题器 */
    const worker = new OCSWorker({
      root: TiMu,
      elements: {
        title: '.Zy_TItle .clearfix',
        /**
         * 兼容各种选项
         *
         * ul li .after 单选多选
         * ul li label:not(.after) 判断题
         * ul li textarea 填空题
         */
        options: 'ul li .after,ul li textarea,ul textarea,ul li label:not(.before)',
        type: 'input[id^="answertype"]'
      },
      /** 默认搜题方法构造器 */
      answerer: (elements, type, ctx) => {
        const title = StringUtils.nowrap(elements.title[0].innerText)
          .replace(/(\d+)?【.*?题】/, '')
          .replace(/（\d+.0分）/, '')
          .trim();
        if (title) {
          return defaultAnswerWrapperHandler(store.setting.answererWrappers, { type, title, root: ctx.root });
        } else {
          throw new Error('题目为空，请查看题目是否为空，或者忽略此题');
        }
      },

      work: {
        /**
         * cx 题目类型 ：
         * 0 单选题
         * 1 多选题
         * 2 简答题
         * 3 判断题
         * 4 填空题
         */
        type({ elements }) {
          const typeInput = elements.type[0] as HTMLInputElement;

          const type = parseInt(typeInput.value);
          return type === 0
            ? 'single'
            : type === 1
              ? 'multiple'
              : type === 2
                ? 'completion'
                : type === 3
                  ? 'judgement'
                  : elements.options[0].tagName === 'TEXTAREA' ||
                    elements.options[0].querySelector('textarea') ||
                    elements.options[0].parentElement?.querySelector('textarea')
                    ? 'completion'
                    : undefined;
        },
        /** 自定义处理器 */
        handler(type, answer, option) {
          if (type === 'judgement' || type === 'single' || type === 'multiple') {
            if (!option.parentElement?.querySelector('input')?.checked) {
              // @ts-ignore
              option.parentElement?.querySelector('a,label')?.click();
            }
          } else if (type === 'completion' && answer.trim()) {
            const textarea = option.parentElement?.querySelector('textarea');
            const textareaFrame = option.parentElement?.querySelector('iframe');
            if (textarea) {
              textarea.value = answer;
            }
            if (textareaFrame?.contentDocument) {
              textareaFrame.contentDocument.body.innerHTML = answer;
            }
          }
        }
      },
      /** 元素搜索完成后 */
      onElementSearched(elements) {
        const typeInput = elements.type[0] as HTMLInputElement;
        const type = parseInt(typeInput.value);
        /** 判断题 */
        if (type === 3) {
          elements.options.forEach((option) => {
            const ri = option.querySelector('.ri');
            const span = document.createElement('span');
            span.innerText = ri ? '√' : '×';
            option.appendChild(span);
          });
        }
      },
      /** 完成答题后 */
      onResult: async (res) => {
        if (res.ctx) {
          store.workResults.push(res);
        }
        const randomWork = store.setting.cx.video.randomWork;
        // 没有完成时随机作答
        if (!res.result?.finish && randomWork.enable) {
          const options = res.ctx?.elements?.options || [];
          const type = res.type;

          if (randomWork.choice && (type === 'judgement' || type === 'single' || type === 'multiple')) {
            const option = options[Math.floor(Math.random() * options.length)];
            // @ts-ignore 随机选择选项
            option.parentElement?.querySelector('a,label')?.click();
          } else if (randomWork.complete && type === 'completion') {
            // 随机填写答案
            for (const option of options) {
              const textarea = option.parentElement?.querySelector('textarea');
              const completeTexts = randomWork.completeTexts
                .filter(Boolean);
              const text = completeTexts[Math.floor(Math.random() * completeTexts.length)];
              const textareaFrame = option.parentElement?.querySelector('iframe');

              if (textarea) {
                textarea.value = text;
              }
              if (textareaFrame?.contentDocument) {
                textareaFrame.contentDocument.body.innerHTML = text;
              }

              await sleep(500);
            }
          }
          logger('info', '正在随机作答');
        } else {
          logger('info', '答题', res.result?.finish ? '完成' : '未完成');
        }
      },

      /** 其余配置 */
      period: (period || 3) * 1000,
      timeout: (timeout || 30) * 1000,
      retry,
      stopWhenError: false
    });

    const results = await worker.doWork();

    logger('info', '做题完毕', results);

    // 处理提交
    await worker.uploadHandler({
      uploadRate: store.setting.cx.video.upload,
      results,
      async callback(finishedRate, uploadable) {
        const name = store.setting.cx.video.upload === 'force' ? '强制提交' : '自动提交';
        logger('info', '完成率 : ', finishedRate, ' , ', uploadable ? '5秒后将' + name : ' 5秒后将自动保存');

        await sleep(5000);

        if (uploadable) {
          // @ts-ignore 提交
          frameWindow.btnBlueSubmit();

          await sleep(3000);
          /** 确定按钮 */
          // @ts-ignore 确定
          frameWindow.submitCheckTimes();
        } else {
          // @ts-ignore 禁止弹窗
          frameWindow.alert = () => { };
          // @ts-ignore 暂时保存
          frameWindow.noSubmit();
        }
      }
    });
  }

  if (setting.waitForCheck) {
    logger('debug', `正在等待答题检查: 一共 ${setting.waitForCheck} 秒`);
    await sleep(setting.waitForCheck * 1000);
  }
}
