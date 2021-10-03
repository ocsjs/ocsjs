
import { OCSEvent, OCSNotify } from '../events/ocs.event';
import { IPCEventTypes } from '../events/index';
import { app } from 'electron';

import fs, { WriteStream } from 'fs';
import path from 'path';
import { Octokit } from "@octokit/rest";
import compressing from 'compressing';

import yaml from 'yaml';

import { AxiosGet } from './axios';


const { rest } = new Octokit();
const owner = 'enncy'
const repo = 'online-course-script';

//使用 通知 显示输出

export const APP_UPDATE = new OCSNotify(IPCEventTypes.APP_UPDATE, "更新程序")

let UPDATE = true


/**
 * 获取最新 release ， 如果提供 tag 则根据 tag 获取
 * @param tag 
 * @returns 
 */
export async function getRelease(tag?: string) {
    return tag
        ? await rest.repos.getReleaseByTag({
            owner, repo, tag
        })
        : await rest.repos.getLatestRelease({
            owner, repo,
        })
}

export async function AutoUpdate(tag?: string) {
    UPDATE = true
    if (app.isPackaged) {
        // 监听停止
        APP_UPDATE.once(IPCEventTypes.CANCEL_APP_UPDATE, () => {
            UPDATE = false
        })

        try {
            APP_UPDATE.info('更新开始', tag ? '，指定版本号 : ' + tag : '');
            // 获取 release
            let release = await getRelease(tag)
            // 获取 assets
            const { data } = await rest.repos.listReleaseAssets({
                owner, repo,
                release_id: release.data.id
            })
            // 获取 latest.yml
            const latest_asset = data.find(a => a.name === 'latest.yml')
            // 获取 app-resource-zip
            const app_asset = data.find(a => a.name === 'ocs-app-resources.zip')

            if (latest_asset && app_asset && UPDATE) {
                if ((await needUpdate(latest_asset.id))) {
                    APP_UPDATE.info('正在更新中')
                    await Update(app_asset.size, app_asset.browser_download_url)
                } else {
                    APP_UPDATE.info("已经是最新版本，无需更新!");
                }
            } else {
                APP_UPDATE.info("找不到最新版本的压缩包!", '请稍后再试');

            }
        } catch (err) {

            APP_UPDATE.error('更新失败!', err)
        }
    } else {
        APP_UPDATE.warn('当前不是生产模式，不能进行更新操作！')
    }


}

/**
 * 更新主程序
 * @param app_asset_id ocs-app-resource.zip assets id
 */
export async function Update(size: number, url: string) {

    APP_UPDATE.info('开始下载最新版本压缩包 ：', url);
    AxiosGet({
        url: url,
        responseType: 'stream'
    }).then((zip) => {

        const data: WriteStream = (zip.data as WriteStream)

        // 监听停止
        APP_UPDATE.once(IPCEventTypes.CANCEL_APP_UPDATE, () => {
            UPDATE = false
            data.destroy()
        })


        const _path = path.resolve('./resources/resource.zip');

        let chunks = ''
        data.on('data', function (chunk) {
            if (!UPDATE) return
            chunks += chunk
            APP_UPDATE.info('下载中 : ' + showFomatSize(chunks.length) + "/" + showFomatSize(size))
        });

        data.pipe(fs.createWriteStream(_path))
            .once("end", function () {
                if (!UPDATE) return
                APP_UPDATE.info("下载完成");
                fs.rmSync(path.resolve('./resources/app/'), { recursive: true, force: true })
                compressing.zip.uncompress(_path, path.resolve('./resources/app'))
                    .then(() => {
                        APP_UPDATE.success("更新成功");
                    })
                    .catch(err => {
                        APP_UPDATE.error('更新失败', err)
                    });
            });
    }).catch((err) => {
        APP_UPDATE.error('更新失败', err)
    });


}
/**
 * 判断是否需要更新
 * @param asset_id 
 * @returns 
 */
export async function needUpdate(latest_asset_id?: number) {

    try {
        let id = latest_asset_id || 0
        if (id) {
            APP_UPDATE.info('正在获取远程最新版本号')
            const asset = await rest.repos.getReleaseAsset({
                owner, repo,
                asset_id: id,
            })

            const latest = await AxiosGet({
                url: asset.data.browser_download_url,
            });

            const newversion = yaml.parse(latest.data).version.replace('v', '')
            APP_UPDATE.info('最新远程版本号为 : ' + newversion)
            const result = compareVersions(newversion, app.getVersion())
            return result === newversion

        }
    } catch (err) {
        APP_UPDATE.error('检测是否需要更新失败! ' + err)
    } finally {
        return true
    }

}

function showFomatSize(size: number) {
    return size > 1024
        ? size > 1024 * 1024
            ? (size / (1024 * 1024)).toFixed(2) + 'MB'
            : (size / 1024).toFixed(2) + 'KB'
        : size + 'Byte'
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
    } else {
        return v1
    }
}
