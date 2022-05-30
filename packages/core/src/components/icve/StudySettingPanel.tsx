import { defineComponent } from 'vue';

import { fixedVideoProgress } from '../../script/icve/study';
import { useSettings, useContext } from '../../store';
import { Tooltip } from '../Tooltip';

export const StudySettingPanel = defineComponent({
  setup () {
    const settings = useSettings().icve.study;
    const ctx = useContext();

    return () => (
      <div class="ocs-setting-panel">
        <div class="ocs-setting-items">

          <label>视频倍速</label>
          <div>
            <Tooltip title="不允许倍速！">
              <input
                type="range"
                value="1"
                disabled
              >
              </input>
            </Tooltip>
            <span>1x</span>
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
            ></input>
            <span> {Math.round(settings.volume * 100)}% </span>
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
                  fixedVideoProgress(settings.showProgress);
                }}
              />
            </Tooltip>
          </div>

          <hr/>
          <hr/>

          <label>PPT翻阅速度/秒</label>
          <div>
            <input
              type="number"
              value={settings.pptRate}
              min="1"
              max="60"
              step="1"
              onChange={(e: any) => (settings.pptRate = e.target.valueAsNumber)}
              onInput={(e: any) => (settings.pptRate = e.target.valueAsNumber)}
            />
          </div>

        </div>
      </div>
    );
  }
});
