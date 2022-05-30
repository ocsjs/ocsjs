import { defineComponent, PropType, toRefs } from 'vue';
import { CommonWorkSetting } from '../../scripts';
import { Tooltip } from '../Tooltip';

export const CommonWorkSettingPanel = defineComponent({
  props: {
    settings: {
      default: () => {},
      type: Object as PropType<CommonWorkSetting>
    }
  },
  emits: ['updateUpload'],
  setup (props, { slots, emit }) {
    const { settings } = toRefs(props);

    return () => (
      <>

        { slots.upload?.()}

        <label>答题间隔(秒)</label>
        <div>
          <input
            type="number"
            value={settings.value.period}
            min="3"
            step="1"
            onChange={(e: any) => (settings.value.period = e.target.valueAsNumber)}
            onInput={(e: any) => (settings.value.period = e.target.valueAsNumber)}
          />
        </div>

        <label>搜题请求超时时间(秒)</label>
        <div>
          <Tooltip title="每道题最多做n秒, 超过则跳过此题。">
            <input
              type="number"
              value={settings.value.timeout}
              min="0"
              step="1"
              onChange={(e: any) => (settings.value.timeout = e.target.valueAsNumber)}
              onInput={(e: any) => (settings.value.timeout = e.target.valueAsNumber)}
            />
          </Tooltip>
        </div>

        <label>搜题超时重试次数</label>
        <div>
          <input
            type="number"
            value={settings.value.retry}
            min="0"
            max="2"
            step="1"
            onChange={(e: any) => (settings.value.retry = e.target.valueAsNumber)}
            onInput={(e: any) => (settings.value.retry = e.target.valueAsNumber)}
          />
        </div>

      </>

    );
  }
});
