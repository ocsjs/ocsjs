import { Remote } from "@/utils/remote";
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
 
export async function refreshUpdateInfo() {
    fetchingInfo.value = true;
    // 获取版本列表
    RepositoryTags.value = await GiteeUpdater.listTags();
 
    // 寻找最新的版本
    const sortTagVersions = Version.sort(RepositoryTags.value.map((t) => t.name));
    LatestTag.value = RepositoryTags.value.find((t) => t.name === sortTagVersions[0]);
    if (LatestTag.value) {
        // 获取版本信息
        LatestInfo.value = await GiteeUpdater.getLatestInfo(LatestTag.value);
        // 检测是否需要更新
        needUpdate.value = await GiteeUpdater.isNeedUpdate(LatestInfo.value);
    }

    fetchingInfo.value = false;
}
