import COS from "cos-js-sdk-v5";
import { LatestType, Tag } from "./types";
import { UpdaterImpl } from "./updater";

var Bucket = "ocs-1301696006"; /* 存储桶 */

var Region = "ap-guangzhou"; /* 存储桶所在地域 */

// 腾讯云对象存储 更新器
export class TencentObjectUpdater extends UpdaterImpl {
    cos: COS;

    constructor() {
        super();
        // 实例化对象
        this.cos = new COS({
            // getAuthorization 必选参数
            getAuthorization: function (options, callback) {
                var url = "https://wk.enncy.cn/sts"; // url替换成您自己的后端服务
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url, true);
                xhr.onload = function (e: any) {
                    try {
                        var { data } = JSON.parse(e.target.responseText);
                        var credentials = data.credentials;
                    } catch (e) {
                        console.error("getAuthorization err", e);
                    }
                    if (!data || !credentials) {
                        return console.error("credentials invalid:\n" + JSON.stringify(data, null, 2));
                    }
                    callback({
                        TmpSecretId: credentials.tmpSecretId,
                        TmpSecretKey: credentials.tmpSecretKey,
                        SecurityToken: credentials.sessionToken,
                        // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
                        StartTime: data.startTime, // 时间戳，单位秒，如：1580000000
                        ExpiredTime: data.expiredTime, // 时间戳，单位秒，如：1580000000
                    });
                };
                xhr.send();
            },
        });
    }

    listTagNames(): Promise<string[]> {
        let tagNames: any[] = [];
        return new Promise((resolve, reject) => {
            this.cos.getBucket(
                {
                    Bucket,
                    Region,
                    Prefix: "tags/",
                    Delimiter: "/",
                },
                function (err, data) {
                    if (err) {
                        console.error("listTagNames err", err);
                    } else {
                        console.log(data);
                        tagNames = data.CommonPrefixes.map((c) => c.Prefix.split("/")[1]);
                        resolve(tagNames);
                    }
                }
            );
        });
    }
    async listTags(): Promise<Tag[]> {
        let tags: Tag[] = [];
        const tagNames = await this.listTagNames();
        for (const version of tagNames) {
            let baseUrl = "https://cdn.ocs.enncy.cn/tags/" + version;
            tags.push({ name: version, latest: baseUrl + "/latest.json", resource: baseUrl, raw: baseUrl + "/ocs-app-resource.zip" });
        }
        return tags;
    }
}
