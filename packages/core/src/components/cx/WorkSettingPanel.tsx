import { defineComponent } from 'vue';
import { createWorkerSetting } from '..';
import { store } from '../../script';
import { Tooltip } from '../Tooltip';

export const WorkSettingPanel = defineComponent({
  setup () {
    const settings = store.setting.cx.work;

    return () => (
      <div class="ocs-setting-panel">
        <div class="ocs-setting-items">
          {createWorkerSetting(
            '作业提交',
            { selected: settings.upload },
            (e: any) => (settings.upload = e.target.value)
          )}

          <label>答题间隔(秒)</label>
          <div>
            <input
              type="number"
              value={settings.period}
              min="0"
              step="1"
              onChange={(e: any) => {
                settings.period = e.target.valueAsNumber;
              }}
            />
          </div>

          <label>搜题请求超时时间(秒)</label>
          <div>
            <Tooltip title="每道题最多做n秒, 超过则跳过此题。">
              <input
                type="number"
                value={settings.timeout}
                min="0"
                step="1"
                onChange={(e: any) => {
                  settings.timeout = e.target.valueAsNumber;
                }}
              />
            </Tooltip>
          </div>

          <label>搜题超时重试次数</label>
          <div>
            <input
              type="number"
              value={settings.retry}
              min="0"
              max="2"
              step="1"
              onChange={(e: any) => {
                settings.retry = e.target.valueAsNumber;
              }}
            />
          </div>

        </div>
      </div>
    );
  }
});
