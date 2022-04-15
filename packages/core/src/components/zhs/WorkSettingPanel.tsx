import { defineComponent } from 'vue';
import { createWorkerSetting } from '..';
import { store } from '../../script';
import { Tooltip } from '../Tooltip';

// 根据上方 vnode 变量 ， 生成 jsx 的渲染函数
export const WorkSettingPanel = defineComponent({
  setup () {
    const settings = store.setting.zhs.work;

    return () => (
      <div class="ocs-setting-panel">
        <div class="ocs-setting-items">
          {createWorkerSetting(
            '作业提交',
            {
              selected: settings.upload
            },
            (e: any) => (settings.upload = e.target.value)
          )}

          <label>答题间隔(秒)</label>
          <div>
            <input
              type="number"
              onChange={(e: any) => (settings.period = e.target.valueAsNumber)}
              value={settings.period}
              min="0"
              step="1"
            ></input>
          </div>

          <label>搜题请求超时时间(秒)</label>
          <div>
            <Tooltip title="每道题最多做n秒, 超过则跳过此题。">
              <input
                type="number"
                onChange={(e: any) => (settings.timeout = e.target.valueAsNumber)}
                value={settings.timeout}
                min="0"
                step="1"
              ></input>
            </Tooltip>
          </div>

          <label>搜题请求重试次数</label>
          <div>
            <input
              type="number"
              onChange={(e: any) => (settings.retry = e.target.valueAsNumber)}
              value={settings.retry}
              min="0"
              max="2"
              step="1"
            ></input>
          </div>

          <label>发生错误时暂停答题</label>
          <div>
            <input
              type="checkbox"
              onChange={(e: any) => (settings.stopWhenError = e.target.checked)}
              checked={settings.stopWhenError}
            ></input>
          </div>
        </div>
      </div>
    );
  }
});
