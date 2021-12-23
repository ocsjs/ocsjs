// 国外cdn网站

import { AxiosGet } from "@/utils/request";
import { LatestType, Tag } from "./types";
import { UpdaterImpl } from "./updater";

export class JsDelivr extends UpdaterImpl {
    async listTagNames(): Promise<string[]> {
        const { data: res } = await AxiosGet("https://data.jsdelivr.com/v1/package/gh/enncy/online-course-script");
        return res.versions;
    }

    async listTags(): Promise<Tag[]> {
        let tags: Tag[] = [];
        const tagNames = await this.listTagNames();
        for (const version of tagNames) {
            let baseUrl = "https://cdn.jsdelivr.net/gh/enncy/online-course-script@" + version + "/resource/";
            tags.push({ name: version, latest: baseUrl + "latest.json", resource: baseUrl + "ocs-app-resource.zip", raw: baseUrl + "ocs-app-resource.zip" });
        }
        return tags;
    }
}
