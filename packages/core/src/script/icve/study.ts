import { domSearch, domSearchAll, sleep, useUnsafeWindow } from '../../core/utils';
import { logger, message } from '../../main';
import { useSettings, useContext } from '../../store';

/**
 * 切换下一个任务
 *
 * @param removeTask 是否标记为已完成
 */
export function nextTask() {
  const { icve } = useSettings();
  if (icve.common.type === 'MOOC') {
    // 找到下一个任务（除外链任务）
    const { sections } = domSearchAll({ sections: '.cellClick .np-section-type:not(.np-section-type.active)' });
    if (sections.length) {
      const cell = sections[0].parentElement;
      logger('info', '即将切换到下一个任务 ' + cell?.dataset.cellname?.trim() || '未知');
      cell?.click();
      study();
    } else {
      message('warn', '没有可学习的任务，学习结束。');
    }
  } else {
    // 找到下一个任务，根据自定义任务获取
    const task = icve.study.cells.find(cell => cell.isTask);
    if (task) {
      logger('info', '即将切换到下一个任务 ' + task.cellName);
      task.isTask = false;
      icve.study.currentTask = task;
      setTimeout(() => {
        window.location.href = task.href;
      }, 1000);
    } else {
      message('warn', '没有可学习的任务，学习结束。');
    }
  }
}

export async function study() {
  await sleep(5000);
  const { icve: settings } = useSettings();
  const { common } = useContext();
  // @ts-ignore
  const fixTime = useUnsafeWindow()?._fixTime || 10;
  const { ppt, video, iframe, link, studyNow, nocaptcha } = domSearch({
    // ppt
    ppt: '.page-bar',
    // ppt
    iframe: 'iframe',
    // 视频
    video: 'video',
    // 链接
    link: '#externalLinkDiv',
    // 学习提示弹窗
    studyNow: '#studyNow',
    // 验证码
    nocaptcha: '#nocaptcha'
  });

  console.log({ ppt, video, iframe, link, studyNow, nocaptcha });

  if (nocaptcha) {
    message('warn', '请手动滑动验证码。');
  } else if (video) {
    // 如果 iframe 不存在则表示只有视频任务，否则表示PPT任务正在运行
    logger('info', '开始播放视频');
    const v = video as HTMLMediaElement;
    common.currentMedia = v;
    video.onended = async () => {
      logger('info', '视频结束');
      await sleep(3000);
      nextTask();
    };
    // 固定进度
    fixedVideoProgress(settings.study.showProgress);
    // 设置音量
    v.volume = settings.study.volume;

    if (v.paused) {
      v.play();
    }
  } else if (iframe && (iframe as HTMLIFrameElement).src.startsWith('https://file.icve.com.cn')) {
    const interval = setInterval(() => {
      if (settings.study.isReading === false) {
        clearInterval(interval);
        nextTask();
      }
    }, settings.study.pptRate * 1000);
  } else if (ppt) {
    logger('info', '开始播放PPT');
    const { pageCount, pageCurrentCount, pageNext } = domSearch({
      pageCount: '.MPreview-pageCount',
      pageNext: '.MPreview-pageNext',
      pageCurrentCount: '.MPreview-pageInput'
    });
    if (pageCurrentCount && pageCount && pageNext) {
      // @ts-ignore
      let count = parseInt(pageCurrentCount.value);
      const total = parseInt(pageCount.innerText.replace('/', '').trim() || '0');

      while (count <= total) {
        // @ts-ignore
        pageNext.click();
        await sleep(1000 * settings.study.pptRate);
        count++;
      }
      logger('info', `PPT播放完成 ${fixTime * 2} 秒后将自动切换下一个任务。`);
      await sleep(1000 * fixTime * 2);
      nextTask();
    } else {
      message('error', '未找到PPT进度，请刷新重试或者跳过此任务。');
    }
  } else if (link && link.style.display !== 'none') {
    logger('info', `链接查看完成，${fixTime}秒后下一个任务`);
    await sleep(1000 * fixTime);
    nextTask();
  } else if (studyNow && studyNow.style.display !== 'none') {
    studyNow.click();
  } else {
    logger('error', '未知的课件类型，请反馈给作者。');
  }
}

/**
 * 永久固定显示视频进度
 */
export function fixedVideoProgress(fixed: boolean) {
  const { common } = useContext();
  const { bar } = domSearch({ bar: '.jw-controlbar' });
  if (common.currentMedia && bar) {
    bar.style.display = fixed ? 'block' : 'none';
    bar.style.visibility = fixed ? 'visible' : 'hidden';
    bar.style.opacity = fixed ? '1' : '0';
  }
}

/**
 * process_html: 页面加载钩子
 * topic_html: 列表展开钩子
 * cell_html: 章节加载钩子
 *
 */
type TemplateType = 'process_html' | 'topic_html' | 'cell_html'

export async function loadTasks() {
  const { icve } = useSettings();
  let loading = false;

  /** 重置 */
  icve.study.cells = [];

  // @ts-ignore
  const _template = useUnsafeWindow().template;

  // @ts-ignore 页面元素加载回调
  useUnsafeWindow().template = function (type: TemplateType, data: any) {
    // 解除加载状态
    loading = false;
    if (type === 'cell_html' && data.code) {
      icve.study.cells = icve.study.cells.concat(data.cellList);
      icve.study.cells = icve.study.cells.map(cell => {
        // 判断进度
        cell.isTask = cell.stuCellPercent !== 100;
        return cell;
      });
    }
    return _template(type, data);
  };

  // @ts-ignore

  const fixTime = useUnsafeWindow()._fixTime;

  /** 加载列表 */
  const { moduleTriggers } = domSearchAll({ moduleTriggers: '.moduleList .openOrCloseModule' });
  /** 删除已经展开的列表 */
  await open(moduleTriggers.filter(trigger => trigger.parentElement?.querySelector('.topicList') === null));
  /** 加载章节 */
  const { topicsTriggers } = domSearchAll({ topicsTriggers: '.topicList .openOrCloseTopic' });
  await open(topicsTriggers);

  // 获取链接
  icve.study.cells = icve.study.cells.map(cell => {
    const { hrefList } = domSearchAll({ hrefList: '[data-href]' });
    cell.href = hrefList.map(el => el.dataset.href).find(href => href?.includes(cell.Id)) || '';
    return cell;
  });

  /** 加载元素并等待请求 */
  async function open(targets: HTMLElement[]) {
    console.log('targets', targets);

    for (const target of targets) {
      target.click();
      await waitForLoading();
      await sleep(1000 * (fixTime + 1));
    }
  }

  /** 等待请求完成 */
  function waitForLoading() {
    loading = true;
    return Promise.race([
      sleep(1000 * 60),
      new Promise<void>((resolve, reject) => {
        setInterval(() => loading === false ? resolve() : undefined, 1000);
      })
    ]);
  }
}
