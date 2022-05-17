import { createNote } from '../../components';
import { defineScript } from '../../core/define.script';
import { store } from '../../store';

export const ICVEScript = defineScript({
  name: '职教云',
  routes: [
    {
      name: '学习脚本',
      url: '**icve.com.cn/study/process/process.html**',
      onload(setting = store.setting.icve) {

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
      name: '学习助手',
      url: '**icve.com.cn/study/process/process.html**',
      el: () => createNote(
        '进入 视频设置面板 可以调整视频设置',
        '5秒后自动开始...'
      )
    }
  ]
});
