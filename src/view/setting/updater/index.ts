import { Version } from "app/types/version";
import { reactive, ref, toRaw, watch } from "vue";
import { createUpdater, UpdateInfos, UpdateNotify } from "./types";
import json from "root/package.json";
import { store } from "app/types/setting";
import { UpdaterImpl } from "./updater";

const local = store.get("updateInfos");
console.log("local", local);

export const updateInfos: UpdateInfos = reactive(
    local !== undefined
        ? JSON.parse(local)
        : {
              autoUpdate: true,
              updateSource: "TencentCloud",
              tags: [],
              currentTag: undefined,
              currentLatestInfo: undefined,
              latestTag: undefined,
              latestInfo: undefined,
              needUpdate: false,
          }
);
// 实时更新
watch(updateInfos, () => {
    console.log("updateInfos change", updateInfos);
    store.set("updateInfos", JSON.stringify(toRaw(updateInfos)));
});

export const Updater: UpdaterImpl = createUpdater(updateInfos.updateSource);
console.log("Updater ", Updater);
// 是否正在获取数据
export const fetchingInfo = ref(false);

// 检测今天是否已经更新过，如果更新过， 则再次启动后会根据缓存，只更新新增的版本信息
export async function refreshUpdateInfo() {
    try {
        fetchingInfo.value = true;
        // 获取版本列表
        updateInfos.tags = await Updater.listTags();
        // 版本列表排序
        updateInfos.tags = updateInfos.tags.sort((a, b) => (Version.from(a.name).greaterThan(Version.from(b.name)) ? -1 : 1));

        updateInfos.latestTag = updateInfos.tags.find((t) => t.name === updateInfos.tags[0].name);

        const currentTag = updateInfos.tags.find((t) => t.name === json.version);
        if (currentTag) {
            updateInfos.currentLatestInfo = await Updater.getLatestInfo(toRaw(currentTag));
        }

        if (updateInfos.latestTag) {
            // 获取版本信息
            updateInfos.latestInfo = await Updater.getLatestInfo(updateInfos.latestTag);

            // 检测是否需要更新
            updateInfos.needUpdate = await Updater.isNeedUpdate(updateInfos.latestInfo);
        }
    } catch (err: any) {
        console.error(err);
        UpdateNotify("error", "更新失败,可能是网络出错,或者更新太频繁，请稍后手动检测更新 : " + err.message);
    } finally {
        console.log("updateInfos", updateInfos);
        fetchingInfo.value = false;
    }
}
