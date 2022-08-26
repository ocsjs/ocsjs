import { defineComponent } from 'vue';
import { useContext, useSettings } from '../../store';

export const LiveSettingPanel = defineComponent({
	setup() {
		const settings = useSettings().cx.live;
		const ctx = useContext();

		return () => (
			<div class="ocs-setting-panel">
				<div class="ocs-setting-items">
					<label>视频倍速 </label>
					<div>
						<input
							type="range"
							value={settings.playbackRate}
							min="1"
							max="16"
							step="0.25"
							onInput={(e: any) => {
								settings.playbackRate = e.target.valueAsNumber;
								if (ctx.common.currentMedia) {
									ctx.common.currentMedia.playbackRate = e.target.valueAsNumber;
								}
							}}
						></input>
						<span style={{ color: settings.playbackRate > 2 ? 'red' : '' }}>{settings.playbackRate.toFixed(2)}x</span>
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

					<label>显示回放进度</label>
					<div>
						<input
							class="input-switch"
							type="checkbox"
							checked={settings.showProgress}
							onChange={(e: any) => {
								settings.showProgress = e.target.checked;
							}}
						/>
					</div>
				</div>
			</div>
		);
	}
});
