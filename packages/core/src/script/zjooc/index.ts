// import { createNote, createSearchResultPanel, createTerminalPanel } from '../../components';
import { createNote, createTerminalPanel } from '../../components';
import { StudySettingPanel } from '../../components/zjooc/StudySettingPanel';
import { defineScript } from '../../core/define.script';
// import { useContext, useSettings } from '../../store';
import { sleep } from '../../core/utils';
import { logger } from '../../logger';
import { study } from './study';

export const ZJOOCScript = defineScript({
  name: '在浙学',
  routes: [
    {
      name: '课程脚本',
      url: 'www.zjooc.cn/ucenter/student/course/study/*/plan/detail/*',
      async onload() {
        logger('info', '5s后开始在浙学课程学习');
        await sleep(5000);
        await study();
      }
    }
  ],
  panels: [
    {
      name: '在浙学助手',
      url: 'https://www.zjooc.cn/ucenter/student/course/build/list',
      el: () => createNote('请点击任意的课程进入。')
    },
    {
      name: '在浙学课程学习助手',
      url: 'https://www.zjooc.cn/ucenter/student/course/study/*/plan',
      el: () => createNote('进入 学习设置面板 可以调整课程学习设置'),
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
