import { domSearch, domSearchAll, sleep } from '../../core/utils';
import { logger } from '../../logger';
import { useContext, useSettings } from '../../store';

const stop = false;

/**
 * zjooc 视频学习
 */
export async function study() {
  const { restudy } = useSettings().zjooc.video;
  logger('info', 'zjooc 学习任务开始');
  // 查找任务
  let list: HTMLLIElement[] = Array.from(document.querySelectorAll('#pane-Chapter li.el-menu-item[role=menuitem]'));

  if (list.length === 0) {
    logger('warn', '课程章数为 0 !');
  } else {
    logger('info', '课程章数', list.length);

    for (let index = 0; index < list.length; index++) {
      const chapter = list[index];
      if ((chapter as Element).classList.contains('is-active')) {
        list = list.slice(index);
        break;
      }
    }
    /** 遍历任务进行学习 */
    for (const item of list) {
      try {
        if (stop) {
          break;
        } else {
          logger(
            'debug',
            `即将开始学习 -- ${item.innerText}`
          );
          item.click();
          await sleep(1000);
          let lessonList: HTMLLIElement[] = Array.from(document.querySelectorAll('div[role=tab] > span'));
          if (lessonList.length === 0) {
            logger('warn', '本章小节数本章小节数为 0 !');
          } else {
            logger('info', '本章小节数', lessonList.length);
            for (let index = 0; index < lessonList.length; index++) {
              const lesson = lessonList[index];
              if ((lesson as Element).classList.contains('is-active')) {
                lessonList = lessonList.slice(index);
                break;
              }
            }
            for (const lesson of lessonList) {
              if (!(lesson.childNodes[0] as Element).classList.contains('complete') || restudy) {
                logger('info', '开始学习 -- ', lesson.innerText);
                lesson.click();
                await sleep(5000);
                if ((lesson.childNodes[0] as Element).classList.contains('icon-shipin')) {
                  logger('debug', '开始播放视频');
                  await watch();
                } else if (document.querySelector('iframe')) {
                  logger('debug', '开始阅读文档');
                  await read();
                }
              } else {
                logger('info', '跳过 -- ', lesson.innerText);
              }
            }
            await sleep(5000);
          }
        }
      } catch (e) {
        logger('error', e);
      }
    }
  }

  logger('info', 'zjooc 学习任务结束');
}

/**
 * 阅读
 * @returns
 */
export async function read() {
  return new Promise<void>((resolve, reject) => {
    try {
      const btn = document.querySelector('.contain-bottom button.el-button.el-button--default') as HTMLButtonElement;

      Promise.resolve(async () => {
        if (btn) {
          sleep(5000);
          btn.click();
        }
        resolve();
      }).then((func) => {
        func();
      }).catch((err) => {
        logger('error', err);
      });
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * 观看视频
 * @param setting
 * @returns
 */
export async function watch() {
  const { volume, playbackRate } = useSettings().zjooc.video;

  return new Promise<void>((resolve, reject) => {
    try {
      const video = document.querySelector('video') as HTMLVideoElement;
      const { common } = useContext();
      // 设置当前视频
      common.currentMedia = video;
      // 如果已经播放完了，则重置视频进度
      video.currentTime = 0;
      // 音量
      video.onvolumechange = function() {
        video.volume = volume;
      };
      video.volume = volume;

      Promise.resolve(async () => {
        await sleep(1000);

        // video.play();
        // setInterval(video.play,1000);
        (document.querySelector('#video-show div[data-title="点击播放"]') as HTMLDivElement).click();
        // 设置播放速度
        await switchPlaybackRate(playbackRate);

        video.onpause = async function () {
          if (!video.ended) {
            if (stop) {
              resolve();
            } else {
              await sleep(50);
              (document.querySelector('#video-show div[data-title="点击播放"]') as HTMLDivElement).click();
            }
          }
        };
        video.onended = function () {
          resolve();
        };
      }).then((func) => {
        func();
      }).catch((err) => {
        logger('error', err);
      });
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * 切换播放速度
 * @param playbackRate 播放速度
 */
export async function switchPlaybackRate(playbackRate: number) {
  await sleep(500);
  const { btn } = domSearch({ btn: '#video-show div[data-title="点击选择速度"]' });
  btn?.click();
  await sleep(500);
  const { rates } = domSearchAll({ rates: '#video-show div[class^="playbackrate"] p' });
  for (const rate of rates) {
    if (rate.innerText.startsWith(`${playbackRate === 1.0 ? '正常' : playbackRate}`)) {
      rate?.click();
      logger('info', '切换播放速度成功');
      return;
    }
  }
  logger('warn', '无匹配播放速度');
}
