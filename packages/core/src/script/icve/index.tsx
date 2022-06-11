import { StudyTaskSettingPanel } from '../../components/icve/StudyTaskSettingPanel';
import { createNote, createTerminalPanel } from '../../components';
import { defineScript } from '../../core/define.script';
import { StudySettingPanel } from '../../components/icve/StudySettingPanel';
import { study } from './study';
import { sleep, urlMatch, useUnsafeWindow } from '../../core/utils';
import { useSettings } from '../../store';
import { logger } from '../../logger';
import { TaskList } from '../../components/icve/TaskList';

export const ICVEScript = defineScript({
  name: '职教云',
  routes: [

    {
      name: '分类脚本',
      url: '**icve.com.cn**',
      onload() {
        const settings = useSettings().icve.common;
        if (urlMatch('mooc.icve.com.cn')) {
          settings.type = 'MOOC';
        } else if (urlMatch('zjy2.icve.com.cn')) {
          settings.type = 'ZJY';
        } else {
          settings.type = undefined;
        }
      }
    },
    {
      name: '学习脚本',
      url: ['**icve.com.cn/common/directory/directory.html**', '**mooc.icve.com.cn/study/courseLearn/resourcesStudy.html**'],
      onload: study
    },
    {
      name: '阅读脚本',
      url: ['**file.icve.com.cn**'],
      async onload() {
        const settings = useSettings().icve.study;
        // @ts-ignore
        const fixTime = useUnsafeWindow()?._fixTime || 10;
        logger('info', '即将开始播放PPT');
        settings.isReading = true;
        await sleep(3000);
        // @ts-ignore
        // eslint-disable-next-line no-unmodified-loop-condition
        while (true) {
          // @ts-ignore
          // eslint-disable-next-line no-undef
          const { gc, Presentation } = useUnsafeWindow();
          // @ts-ignore
          const { TotalSlides } = Presentation.GetContentDetails();
          if (gc < TotalSlides) {
            console.log(gc, TotalSlides);

            await sleep(useSettings().icve.study.pptRate * 1000);
            // @ts-ignore
            Presentation.Next();
          } else {
            break;
          }
        }
        logger('info', `PPT播放完成 ${fixTime * 2} 秒后将自动切换下一个任务。`);
        await sleep(1000 * fixTime * 2);
        settings.isReading = false;
      }
    }

  ],
  panels: [
    {
      name: 'MOOC助手',
      url: ['**mooc.icve.com.cn/study/courseLearn/process.html**', '**mooc.icve.com.cn/profile.html**'],
      el: () => createNote('提示您:', '请点击任意的课程或课件进入。')
    },
    {
      name: '职教云助手',
      url: '**zjy2.icve.com.cn/student/studio/studio.html**',
      el: () => createNote('提示您:', '请点击任意的课程进入。')
    },
    {
      name: '课件助手',
      url: '**zjy2.icve.com.cn/study/process/process.html**',
      el: () => createNote(
        '请进入 任务选择 选择您的任务，并开始学习。'
      ),
      children: [
        {
          name: '任务选择',
          el: () => StudyTaskSettingPanel
        }
      ]
    },
    {
      name: '学习助手',
      url: [
        '**zjy2.icve.com.cn/common/directory/directory.html**',
        '**mooc.icve.com.cn/study/courseLearn/resourcesStudy.html**'
      ],
      el: () => createNote(
        '进入 学习设置面板 可以调整学习设置',
        '5秒后自动开始...'
      ),
      children: [
        {
          name: '学习设置',
          el: () => StudySettingPanel
        },
        {
          name: '任务列表',
          hide: useSettings().icve.common.type === 'MOOC',
          el: () => <TaskList selectable={false} />
        },
        createTerminalPanel()
      ]
    }

  ]
});
