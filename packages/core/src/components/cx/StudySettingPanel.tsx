import { defineComponent } from 'vue';
import { createWorkerSetting } from '..';

import { fixedVideoProgress, switchPlayLine } from '../../script/cx/study';
import { useContext, useSettings } from '../../store';
import { Tooltip } from '../Tooltip';
import { CommonWorkSettingPanel } from './CommonWorkSettingPanel';

export const StudySettingPanel = defineComponent({
  setup () {
    const settings = useSettings().cx.study;
    const ctx = useContext();
    const workSettings = useSettings().cx.work;

    return () => (
      <div class="ocs-setting-panel">
        <div class="ocs-setting-items">
          <label>视频倍速 </label>
          <div>
            <Tooltip title="高倍速(大于1倍)可能导致: \n- 记录清空\n- 频繁验证码\n超星后台可以看到学习时长\n请谨慎设置❗\n如果设置后无效则是超星不允许使用倍速。">
              <input
                type="range"
                value={settings.playbackRate}
                min="1"
                max="16"
                step="1"
                onInput={(e: any) => {
                  settings.playbackRate = e.target.valueAsNumber;
                  if (ctx.common.currentMedia) {
                    ctx.common.currentMedia.playbackRate = e.target.valueAsNumber;
                  }
                }}
              ></input>
            </Tooltip>
            <span style={{ color: settings.playbackRate > 2 ? 'red' : '' }}>{settings.playbackRate}x</span>
          </div>

          <label>音量调节</label>
          <div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.volume}
              onInput={(e: any) => {
                settings.volume = e.target.valueAsNumber;
                if (ctx.common.currentMedia) ctx.common.currentMedia.volume = e.target.valueAsNumber;
              }}
            />
            <span> {Math.round(settings.volume * 100)}% </span>
          </div>

          <label>播放路线</label>
          <div>
            <Tooltip title="如果当前视频卡顿严重，可以尝试切换路线。">
              <select
                id="video-line"
                value={settings.line || '默认路线'}
                onChange={(e: any) => {
                  settings.line = e.target.value;
                  if (ctx.cx.videojs && ctx.common.currentMedia) {
                    switchPlayLine(settings, ctx.cx.videojs, ctx.common.currentMedia, e.target.value);
                  }
                }}
              >
                {settings.playlines.map((line: any) => (
                  <option value={line}>{line}</option>
                ))}
              </select>
            </Tooltip>
          </div>

          <label>显示视频进度</label>
          <div>
            <Tooltip title="固定进度条，防止进度条消失。">
              <input
                class="input-switch"
                type="checkbox"
                checked={settings.showProgress}
                onChange={(e: any) => {
                  settings.showProgress = e.target.checked;
                  fixedVideoProgress(e.target.checked);
                }}
              />
            </Tooltip>
          </div>

          <label>复习模式</label>
          <div>
            <Tooltip title="遇到看过的视频,音频,ppt会重新播放，并且从第一个章节开始。">
              <input
                class="input-switch"
                type="checkbox"
                checked={settings.restudy}
                onChange={(e: any) => (settings.restudy = e.target.checked)}
              />
            </Tooltip>
          </div>

          <hr />
          <hr />

          <CommonWorkSettingPanel
            settings={workSettings}
            v-slots={{
              upload: createWorkerSetting(
                '自动答题',
                { selected: settings.upload },
                (e: any) => (settings.upload = e.target.value)
              ),
              extra: (
                <>
                  <label>强制答题</label>
                  <div>
                    <Tooltip title="当章节测试不是任务点时，强制自动答题。\n(左上角有黄点的代表此小节是任务点)\n(一般来说不是任务点的章节测试是不计分的)">
                      <input
                        class="input-switch"
                        type="checkbox"
                        checked={settings.forceWork}
                        onChange={(e: any) => (settings.forceWork = e.target.checked)}
                      />
                    </Tooltip>
                  </div>
                  <label>随机作答</label>
                  <Tooltip title="随机作答 未完成/未匹配 的题目，开启后可自定义选项">
                    <input
                      class="input-switch"
                      type="checkbox"
                      checked={settings.randomWork.enable}
                      onChange={(e: any) => (settings.randomWork.enable = e.target.checked)}
                    />
                  </Tooltip>
                  {settings.randomWork.enable &&
                (
                  <>
                    <label>选择随机</label>
                    <Tooltip title="随机作答 单选/多选/判断 题">
                      <input
                        class="input-switch"
                        type="checkbox"
                        checked={settings.randomWork.choice}
                        onChange={(e: any) => (settings.randomWork.choice = e.target.checked)}
                      />
                    </Tooltip>
                    <label>填空随机</label>
                    <Tooltip title="随机作答填空题">
                      <input
                        class="input-switch"
                        type="checkbox"
                        checked={settings.randomWork.complete}
                        onChange={(e: any) => (settings.randomWork.complete = e.target.checked)}
                      />
                    </Tooltip>
                    {settings.randomWork.complete && (
                      <>
                        <label>填空随机文案</label>
                        <Tooltip title="每行一个，随机填入">
                          <textarea
                            value={settings.randomWork.completeTexts
                              .map(String)
                              .filter((s:any) => s.trim().length > 0)
                              .join('\n')}
                            onInput={(e: any) =>
                              (settings.randomWork.completeTexts = e.target.value
                                .map(String)
                                .filter((s:any) => s.trim().length > 0)
                                .split('\n')
                              )}
                          />
                        </Tooltip>
                      </>
                    )}
                  </>
                )}
                </>
              )
            }}>
          </CommonWorkSettingPanel>

        </div>
      </div>
    );
  }
});
