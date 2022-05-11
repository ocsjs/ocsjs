import { defineComponent } from 'vue';
import { createWorkerSetting } from '..';
import { store } from '../../script';
import { Tooltip } from '../Tooltip';

export const ExamSettingPanel = defineComponent({
  setup () {
    const settings = store.setting.cx.exam;

    return () => (
      <div class="ocs-setting-panel">
        <div class="ocs-setting-items">
          {createWorkerSetting(
            '自动答题',
            {
              selected: 'close',
              options: [
                {
                  label: '请自行检查后自行点击提交',
                  value: 'close'
                }
              ]
            },
            (e: any) => (settings.upload = e.target.value)
          )}

          <label>答题间隔(秒)</label>
          <div>
            <input
              type="number"
              value={settings.period}
              min="3"
              step="1"
              onChange={(e: any) => (settings.period = e.target.valueAsNumber)}
              onInput={(e: any) => (settings.period = e.target.valueAsNumber)}
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
                onChange={(e: any) => (settings.timeout = e.target.valueAsNumber)}
                onInput={(e: any) => (settings.timeout = e.target.valueAsNumber)}
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
              onChange={(e: any) => (settings.retry = e.target.valueAsNumber)}
              onInput={(e: any) => (settings.retry = e.target.valueAsNumber)}
            />
          </div>
          <label>答题完成后等待(秒)</label>
          <div>
            <Tooltip title="自动答题完成后的等待时间, 可适当延长方便对题目检查或者使用第三方工具答题。">
              <input
                type="number"
                value={settings.waitForCheck}
                min="5"
                step="1"
                onChange={(e: any) => (settings.waitForCheck = e.target.valueAsNumber)}
                onInput={(e: any) => (settings.waitForCheck = e.target.valueAsNumber)}
              />
            </Tooltip>
          </div>

        </div>
      </div>
    );
  }
});
