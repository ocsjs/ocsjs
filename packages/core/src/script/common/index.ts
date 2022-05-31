import { createNote } from '../../components';
import { defineScript } from '../../core/define.script';
import { onComplete, onInteractive, useUnsafeWindow } from '../../core/utils';

const supports = ['*'];

export const CommonScript = defineScript({
  name: '默认脚本',
  routes: [

    {
      name: '禁止弹窗脚本',
      url: supports,
      onstart() {
        try {
          // @ts-ignore
          if (typeof useUnsafeWindow() !== 'undefined') {
            // @ts-ignore
            // eslint-disable-next-line no-undef
            useUnsafeWindow().alert = console.log;
          }
          window.alert = self.alert = console.log;
        } catch (e) {
          // @ts-ignore
          console.error('禁止弹窗脚本错误', e.message);
        }
      }
    },
    {
      name: '开启页面复制粘贴功能',
      url: supports,
      onstart() {
        function enableCopy() {
          try {
            const d = document;
            const b = document.body;
            d.onselectstart = d.oncopy = d.onpaste = d.onkeydown = d.oncontextmenu = () => true;
            b.onselectstart = b.oncopy = b.onpaste = b.onkeydown = b.oncontextmenu = () => true;
          } catch (err) {
            console.error('页面复制粘贴功能开启失败', err);
          }

          const style = document.createElement('style');
          style.innerHTML = `
                        html * {
                          -webkit-user-select: text !important;
                          -khtml-user-select: text !important;
                          -moz-user-select: text !important;
                          -ms-user-select: text !important;
                          user-select: text !important;
                        }`;

          document.body.appendChild(style);
        }
        onInteractive(() => enableCopy());
        onComplete(() => {
          enableCopy();
          setTimeout(() => enableCopy(), 3000);
        });
      }
    }
  ],
  panels: [
    {
      name: 'OCS助手',
      priority: 100,
      default: true,
      url: supports,
      el: () =>
        createNote(
          '提示： 手动点击进入视频，作业，考试页面，即可自动运行',
          '注意！ 请将浏览器页面保持最大化，或者缩小，但是不能最小化，可能导致视频播放错误！',
          '拖动上方标题栏可以进行拖拽'
        )
    }
  ]
});
