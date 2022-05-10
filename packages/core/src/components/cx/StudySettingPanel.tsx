import { defineComponent } from 'vue';
import { createWorkerSetting } from '..';
import { store } from '../../script';
import { switchPlayLine } from '../../script/cx/study';
import { Tooltip } from '../Tooltip';

export const StudySettingPanel = defineComponent({
  setup () {
    const settings = store.setting.cx.video;

    return () => (
      <div class="ocs-setting-panel">
        <div class="ocs-setting-items">
          <label>视频倍速 </label>
          <div>
            <Tooltip title="高倍速(大于1倍)可能导致: \n- 记录清空\n- 频繁验证码\n超星后台可以看到学习时长\n请谨慎设置❗\n如果设置后无效则是超星不允许使用倍速。">
              <input
                style={{ color: settings.playbackRate > 2 ? 'red' : '' }}
                type="number"
                value={settings.playbackRate}
                min="1"
                max="16"
                step="1"
                onChange={(e: any) => {
                  settings.playbackRate = e.target.valueAsNumber;
                  if (store.currentMedia) {
                    store.currentMedia.playbackRate = e.target.valueAsNumber;
                  }
                }}
              ></input>
            </Tooltip>
          </div>

          <label>播放路线</label>
          <div>
            <Tooltip title="如果当前视频卡顿严重，可以尝试切换路线。">
              <select
                id="video-line"
                value={settings.line || ''}
                onChange={(e: any) => {
                  settings.line = e.target.value;
                  if (store.videojs && store.currentMedia) {
                    switchPlayLine(settings, store.videojs, store.currentMedia, e.target.value);
                  }
                }}
              >
                {settings.line
                  ? (
                  <option value={settings.line}>指定-{settings.line}</option>
                    )
                  : (
                  <option value="">请指定路线(播放视频后才可选择, 无需保存)</option>
                    )}
                {Array.from(settings.playlines || [{ label: '公网1' }, { label: '公网2' }]).map((line: any) => (
                  <option value={line.label}>{line.label}</option>
                ))}
              </select>
            </Tooltip>
          </div>

          <label>音量调节</label>
          <div>
            <input
              class="ocs-setting-item"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.volume}
              onInput={(e: any) => {
                settings.volume = e.target.valueAsNumber;
                if (store.currentMedia) store.currentMedia.volume = e.target.valueAsNumber;
              }}
            />
            <span> {Math.round(settings.volume * 100)}% </span>
          </div>

          <label>复习模式</label>
          <div>
            <Tooltip title="遇到看过的视频,音频,ppt会重新播放，并且从第一个章节开始。">
              <input
                class="ocs-setting-item"
                type="checkbox"
                checked={settings.restudy}
                onChange={(e: any) => {
                  settings.restudy = e.target.checked;
                }}
              />
            </Tooltip>
          </div>
          <hr />
          <hr />
          {createWorkerSetting(
            '自动答题',
            { selected: settings.upload },
            (e: any) => (settings.upload = e.target.value)
          )}

          <label>答题间隔(秒)</label>
          <div>
            <input
              type="number"
              value={store.setting.cx.work.period}
              min="3"
              step="1"
              onChange={(e: any) => (store.setting.cx.work.period = e.target.valueAsNumber)}
              onInput={(e: any) => (store.setting.cx.work.period = e.target.valueAsNumber)}
            />
          </div>

          <label>搜题请求超时时间(秒)</label>
          <div>
            <Tooltip title="每道题最多做n秒, 超过则跳过此题。">
              <input
                type="number"
                value={store.setting.cx.work.timeout}
                min="0"
                step="1"
                onChange={(e: any) => (store.setting.cx.work.timeout = e.target.valueAsNumber)}
                onInput={(e: any) => (store.setting.cx.work.timeout = e.target.valueAsNumber)}
              />
            </Tooltip>
          </div>

          <label>搜题超时重试次数</label>
          <div>
            <input
              type="number"
              value={store.setting.cx.work.retry}
              min="0"
              max="2"
              step="1"
              onChange={(e: any) => (store.setting.cx.work.retry = e.target.valueAsNumber)}
              onInput={(e: any) => (store.setting.cx.work.retry = e.target.valueAsNumber)}
            />
          </div>

          <label>答题完成后等待(秒)</label>
          <div>
          <Tooltip title="自动答题完成后的等待时间, 可适当延长方便对题目检查或者使用第三方工具答题。">
              <input
                type="number"
                value={store.setting.cx.work.waitForCheck}
                min="5"
                step="1"
                onChange={(e: any) => (store.setting.cx.work.waitForCheck = e.target.valueAsNumber)}
                onInput={(e: any) => (store.setting.cx.work.waitForCheck = e.target.valueAsNumber)}
              />
            </Tooltip>
          </div>

        </div>
      </div>
    );
  }
});
