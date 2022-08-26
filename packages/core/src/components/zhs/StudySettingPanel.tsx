import { defineComponent, ref } from 'vue';

import { autoClose, fixedVideoProgress, switchPlaybackRate } from '../../script/zhs/study';
import { useContext, useSettings } from '../../store';
import { Tooltip } from '../Tooltip';

export const StudySettingPanel = defineComponent({
	setup() {
		const settings = useSettings().zhs.video;
		const ctx = useContext();

		showCloseDate();

		/** 显示关闭时间 */
		function showCloseDate() {
			const closeDate = new Date();
			closeDate.setMinutes(closeDate.getMinutes() + settings.watchTime * 60);
			settings.closeDate = closeDate;
		}

		// 切换倍速防抖
		const switching = ref(false);

		return () => (
			<div class="ocs-setting-panel">
				<div class="ocs-setting-items">
					{settings.creditStudy === false
						? [
								<label>自动暂停</label>,
								<div>
									<Tooltip title="播放时间到后, 将会自动暂停。\n如设置为0, 则不会自动暂停\n自动暂停可以帮助你获取智慧树的平时分，每天学习超过半小时就算一次平时分。">
										<input
											type="number"
											value={settings.watchTime}
											min="0"
											max="24"
											step="0.5"
											onChange={(e: any) => {
												settings.watchTime = e.target.valueAsNumber;
												showCloseDate();
												autoClose(e.target.valueAsNumber);
											}}
										></input>
									</Tooltip>
									<span>小时</span>
								</div>,

								<label>暂停时间</label>,
								<div>
									{settings.watchTime === 0 ? (
										<span>设置为0将不会自动暂停</span>
									) : (
										<span>将在 {settings.closeDate.toLocaleString()} 暂停</span>
									)}
								</div>
						  ]
						: []}

					<label>视频画质</label>
					<div>
						<Tooltip title="默认画质为流畅">
							<select
								onChange={(e: any) => {
									settings.definition = e.target.value;
									(document.querySelector('.' + e.target.value) as any).click();
								}}
							>
								<option
									value="line1bq"
									selected={settings.definition === 'line1bq'}
								>
									流畅
								</option>
								<option
									value="line1gq"
									selected={settings.definition === 'line1gq'}
								>
									高清
								</option>
							</select>
						</Tooltip>
					</div>

					{settings.creditStudy === true ? (
						<>
							<label>视频倍速 </label>
							<div>
								<Tooltip title="学分课不允许倍速！">
									<input
										type="range"
										value="1"
										disabled
									></input>
								</Tooltip>
								<span>1x</span>
							</div>
						</>
					) : (
						<>
							<label>视频倍速 </label>
							<div>
								<Tooltip title="智慧树最高1.5倍速, 超过1.5容易封号！">
									<input
										type="range"
										step="0.25"
										max="1.5"
										min="1"
										value={settings.playbackRate}
										disabled={switching.value}
										onChange={async (e: any) => {
											switching.value = true;
											settings.playbackRate = e.target.valueAsNumber;
											await switchPlaybackRate(settings.playbackRate);
											switching.value = false;
										}}
									></input>
								</Tooltip>
								<span>{settings.playbackRate}x</span>
							</div>
						</>
					)}

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
									fixedVideoProgress(e.target.checked);
								}}
							/>
						</Tooltip>
					</div>

					<label>复习模式</label>
					<div>
						<Tooltip title="将播放过的视频再播放一遍。">
							<input
								class="input-switch"
								type="checkbox"
								checked={settings.restudy}
								onChange={(e: any) => (settings.restudy = e.target.checked)}
							></input>
						</Tooltip>
					</div>
				</div>
			</div>
		);
	}
});
