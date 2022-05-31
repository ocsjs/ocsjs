import { StudyTaskSettingPanel } from './../../components/icve/StudyTaskSettingPanel';
import { createNote, createTerminalPanel } from '../../components';
import { defineScript } from '../../core/define.script';
import { StudySettingPanel } from '../../components/icve/StudySettingPanel';
import { study } from './study';
import { sleep } from '../../core/utils';
import { useSettings } from '../../store';

export const ICVEScript = defineScript({
  name: '职教云',
  routes: [
    {
      name: '任务分配脚本',
      url: '**icve.com.cn/study/process/process.html**',
      onload() { }
    },
    {
      name: '学习脚本',
      url: ['**icve.com.cn/common/directory/directory.html**'],
      onload: study
    },
    {
      name: '阅读脚本',
      url: ['**file.icve.com.cn**'],
      async onload() {
        await sleep(6000);
        // @ts-ignore
        // eslint-disable-next-line no-undef
        sendToParent({ type: 'read-start' });

        await sleep(5000);
        // @ts-ignore
        // eslint-disable-next-line no-undef
        const { gc, Presentation } = useUnsafeWindow();
        // @ts-ignore
        const { TotalSlides } = Presentation.GetContentDetails();
        // @ts-ignore
        // eslint-disable-next-line no-unmodified-loop-condition
        while (gc < TotalSlides) {
          await sleep(useSettings().icve.study.pptRate * 1000);
          // @ts-ignore
          Presentation.Next();
        }
        // @ts-ignore
        // eslint-disable-next-line no-undef
        sendToParent({ type: 'read-finish' });
      }
    }

  ],
  panels: [
    {
      name: '职教云助手',
      url: '**icve.com.cn/student/studio/studio.html**',
      el: () => createNote('提示您:', '请点击任意的课程进入。')
    },
    {
      name: '课件助手',
      url: '**icve.com.cn/study/process/process.html**',
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
        '**icve.com.cn/common/directory/directory.html**'
      ],
      el: () => createNote(
        '进入 学习设置面板 可以调整学习设置',
        '当前任务: ' + (useSettings().icve.study.currentTask?.cellName || '无'),
        '5秒后自动开始...'
      ),
      children: [
        {
          name: '学习设置',
          el: () => StudySettingPanel
        },
        createTerminalPanel()
      ]
    }

  ]
});
