
import { AxiosGet } from './updater/axios';
// import { AutoUpdater } from './updater/auto.updater';

// AutoUpdater.checkUpdate()

import fs from 'fs';
import path from 'path';
import { Octokit } from "@octokit/rest";
import compressing from 'compressing';
import { log } from 'electron-log';
import yaml from 'yaml';
import { app } from 'electron';

import { ScriptEvent } from './electron/event';


const { rest } = new Octokit();
const owner = 'enncy'
const repo = 'online-course-script';
// Compare: https://docs.github.com/en/rest/reference/repos/#list-organization-repositories
const { info, error, success } = new ScriptEvent('update-event')
export async function AutoUpdate(tag?: string) {
    info('开始更新', tag ? '指定版本号 : ' + tag : '');
    let release = tag
        ? await rest.repos.getReleaseByTag({
            owner, repo, tag
        })
        : await rest.repos.getLatestRelease({
            owner, repo,
        })
        
    const { data } = await rest.repos.listReleaseAssets({
        owner, repo,
        release_id: release.data.id
    })

    const latest_asset_id = data.find(a => a.name === 'latest.yml')?.id
    if (latest_asset_id && needUpdate(latest_asset_id)) {

        const asset_id = data.find(a => a.name === 'ocs-app-resources.zip')?.id
        if (asset_id) {

            const asset = await rest.repos.getReleaseAsset({
                owner, repo,
                asset_id,
            })
            info('开始下载最新版本压缩包 :', asset.data.browser_download_url);
            const zip = await AxiosGet({
                url: asset.data.browser_download_url,
                responseType: 'stream'
            });
            const _path = path.resolve('./resources/resource.zip');
            log("下载到本地路径 : ", _path);

            (zip.data as any).pipe(fs.createWriteStream(_path))
                .on("close", function () {
                    success("下载完成");
                    fs.rmSync(path.resolve('./resources/app/'), { recursive: true, force: true })
                    compressing.zip.uncompress(_path, path.resolve('./resources/app'))
                        .then(() => {
                            success("更新成功");
                        })
                        .catch(err => {
                            error('更新失败', err)
                        });
                });


        } else {
            info("找不到最新版本的压缩包!", '请稍后再试');
        }
    } else {
        info("已经是最新版本，无需更新!");
    }


}


export async function needUpdate(asset_id: number) {

    const asset = await rest.repos.getReleaseAsset({
        owner, repo,
        asset_id,
    })

    const latest = await AxiosGet({
        url: asset.data.browser_download_url,
    });


    const newversion = yaml.parse(latest.data).version.replace('v', '')
    const result = compareVersions(newversion, app.getVersion())
    return result === newversion
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
