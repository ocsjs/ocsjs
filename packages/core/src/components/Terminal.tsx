import { defineComponent, nextTick, onMounted, watch } from 'vue';
import { domSearch } from '../core/utils';
import { panel } from '../start';
import { useStore } from '../store';

export const Terminal = defineComponent({
  setup () {
    const local = useStore('localStorage');

    onMounted(() => {
      // 监听改变，并且滚动到最下方
      watch(local.logs,
        // eslint-disable-next-line vue/valid-next-tick
        () => nextTick(() => scroll())
      );

      function scroll () {
        if (panel) {
          // 控制台元素
          const { terminal } = domSearch({ terminal: '.terminal' }, panel);
          if (terminal?.scrollHeight) {
            terminal?.scrollTo({
              behavior: 'auto',
              top: terminal.scrollHeight
            });
          }
        }
      }
    });

    return () => (
      <div class="terminal">
        {local.logs.map((log: any) => (
          <div>
            <span style={{ color: 'gray' }}>{new Date(log.time).toLocaleTimeString('zh-CN')}</span>
            <span> </span>
            <level class={log.level}>{log.extra}</level>
            <span> </span>
            <span innerHTML={log.text}></span>
          </div>
        ))}
      </div>
    );
  }
});
