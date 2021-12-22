 
import { AxiosGet } from "@/utils/request";
import {   LatestType, Tag } from "./types";
import { UpdaterImpl } from "./updater";

 
// gitee 码云 更新服务器
export class Gitee extends UpdaterImpl {
    async listTagNames(): Promise<string[]> {
        const { data: res } = await AxiosGet("https://gitee.com/api/v5/repos/enncy/online-course-script/tags");
        return res.map((f: any) => f.name);
    }

    async listTags(): Promise<Tag[]> {
        // 获取所有 tag 标签
        const { data: res } = await AxiosGet("https://gitee.com/api/v5/repos/enncy/online-course-script/tags");
        const tags: Tag[] = [];
        for (const { name, commit } of res as any[]) {
            // 递归获取文件树
            const { data: trees } = await AxiosGet(`https://gitee.com/api/v5/repos/enncy/online-course-script/git/trees/${commit.sha}?recursive=1`);
            let resource = "",
                raw = "",
                latest = "";
            // 在资源树中寻找文件
            for (const { path, size, sha } of (trees as any).tree) {
                if (/ocs-app-resource\.zip/.test(path)) {
                    resource = `https://gitee.com/enncy/online-course-script/blob/${name}/${path}`;
                    raw = `https://gitee.com/api/v5/repos/enncy/online-course-script/git/blobs/${sha}`;
                }
                if (/latest\.json/.test(path)) {
                    latest = `https://gitee.com/api/v5/repos/enncy/online-course-script/git/blobs/${sha}`;
                }

                if (resource && latest) {
                    break;
                }
            }
            if (resource && raw && latest) {
                tags.push({ name, latest, resource, raw });
            }
        }
        return tags;
    }
    async getLatestInfo(tag: Tag): Promise<LatestType> {
        const url = await this.resolveLatestUrl(tag);
        const { data } = await AxiosGet(url);
        let latest: LatestType = JSON.parse(Buffer.from(data.content, "base64").toString());
        if (typeof latest.message === "string") {
            latest.message = [latest.message];
        } else if (typeof latest.message === "object") {
            latest.message = latest.message.length === 0 ? ["暂无"] : [...latest.message];
        } else {
            latest.message = ["暂无"];
        }
        return latest;
    }
 
}