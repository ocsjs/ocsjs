
import { getResource, getVersion } from './api'

import fs from 'fs';

import { app } from 'electron';
import { Octokit } from '@octokit/rest';
import { AxiosGet } from './axios';
import yaml from 'yaml';


const { rest } = new Octokit();
const owner = 'enncy'
const repo = 'online-course-script';

interface CheckUpdateParam {
    /**   是否需要更新 */
    needUpdate?: boolean,
    /** 最新版本 */
    latestVersion?: string,
    /** 是否错误 */
    err?: string
}
export class AutoUpdater {

    /**
     * 查看是否需要更新
     * @returns 
     */
    static async checkUpdate(): Promise<CheckUpdateParam> {
        try {
            let release = await rest.repos.getLatestRelease({
                owner, repo,
            })

            const { data } = await rest.repos.listReleaseAssets({
                owner, repo,
                release_id: release.data.id
            })
            const asset_id = data.find(a => a.name === 'latest.yml')?.id
            if (asset_id) {
                const asset = await rest.repos.getReleaseAsset({
                    owner, repo,
                    asset_id,
                })

                const latest = await AxiosGet({
                    url: asset.data.browser_download_url,
                });


                const newversion = yaml.parse(latest.data).version.replace('v', '')
                const result = compareVersions(newversion, app.getVersion())
                return {
                    // 匹配当前版本和远程版本
                    needUpdate: result === newversion,
                    latestVersion: result
                }
            }


        } catch (__) {
            
        }

        return {
            err: '网络错误!'
        }
    }

    /**
     * 
     * @param path  最新文件的保存路径
     * @param version 根据版本更新
     * @returns 
     */
    static update(path: string, version?: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                const resource = await getResource(version)
                resource.pipe(fs.createWriteStream(path))
                    .on("close", function () {
                        resolve(true)
                    });
            } catch (_) {
                reject(false)
            }
        });

    }
}






/**
 * 比较2个版本，返回最大的那个 
 */
function compareVersions(v1: string, v2: string) {
    let v1_nums = v1.match(/\d/g)?.map(v => parseInt(v))
    let v2_nums = v2.match(/\d/g)?.map(v => parseInt(v))
    if (v1_nums && v2_nums) {
        for (let i = 0; i < v1_nums.length; i++) {
            if (v1_nums[i] > v2_nums[i]) {
                return v1
            } else if (v1_nums[i] < v2_nums[i]) {
                return v2
            }
        }
    } else return v1
}
