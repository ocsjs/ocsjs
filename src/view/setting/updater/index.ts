import { ElectronVersion, Remote } from "@/utils/remote";
import { Version } from "app/types/version";
import { ref } from "vue";
import { Gitee, LatestType, Tag } from "./types";

// 仓库标签
export const RepositoryTags = ref<Tag[]>([]);
// 更新程序
export const GiteeUpdater = new Gitee();
// 是否正在获取数据
export const fetchingInfo = ref(true);
// 更新信息
export const LatestInfo = ref<LatestType | undefined>(undefined);
// 最新的版本Tag
export const LatestTag = ref<Tag | undefined>(undefined);
// 是否需要更新
export const needUpdate = ref(false);
// 当前的远程版本信息
export const CurrentLatestInfo = ref<LatestType | undefined>(undefined);

export async function refreshUpdateInfo() {
    fetchingInfo.value = true;
    // 获取版本列表
    RepositoryTags.value = await GiteeUpdater.listTags();
    console.log("RepositoryTags",RepositoryTags.value);
    // 寻找最新的版本
    const sortTagVersions = Version.sort(RepositoryTags.value.map((t) => t.name));
    console.log("sortTagVersions",sortTagVersions);
    
    LatestTag.value = RepositoryTags.value.find((t) => t.name === sortTagVersions[0]);
    console.log("LatestTag",LatestTag.value);
    const currentTag = RepositoryTags.value.find((t) => t.name === ElectronVersion);
    if (currentTag) {
        console.log("currentTag",currentTag);
        CurrentLatestInfo.value = await GiteeUpdater.getLatestInfo(currentTag);
        console.log("CurrentLatestInfo",CurrentLatestInfo.value);
    }

    if (LatestTag.value) {
        // 获取版本信息
        LatestInfo.value = await GiteeUpdater.getLatestInfo(LatestTag.value);
        console.log("LatestInfo",LatestInfo.value);
        // 检测是否需要更新
        needUpdate.value = await GiteeUpdater.isNeedUpdate(LatestInfo.value);
        console.log("needUpdate",needUpdate.value);
    }

    fetchingInfo.value = false;
}
