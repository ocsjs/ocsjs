import { AxiosGet } from './axios';

import yaml from 'yaml'
import { Assets, getReleases } from './api'
 

import { app } from 'electron';

export class AutoUpdater {

    static checkUpdate(): Promise<{ updated: boolean, msg: string }> {
        return new Promise(async (resolve, reject) => {
            const releases = await getReleases()
            const first = releases?.shift()
            let yml: Assets | undefined = first?.assets.find(asset => asset.name === 'latest.yml')
            let resource: Assets | undefined = first?.assets.find(asset => asset.name === 'ocs-app-resources.zip')
            if (yml && resource) {
                // 查找版本文件
                AxiosGet({
                    url: yml.browser_download_url
                }).then(({ data }) => {
                    // 比对版本
                    const newversion = yaml.parse(data).version.replace('v', '')
                    if (compareVersions(newversion, app.getVersion()) === newversion) {
                        AxiosGet({
                            url: resource?.browser_download_url,
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded"
                            },
                            responseType: 'blob'
                        }).then(({ data }) => {
                            console.log(data);
                            resolve({
                                updated:true,
                                msg:'更新成功!'
                            })
                        }).catch((err) => {
                            reject('网络错误,或者更新失败! ' + err)
                        });
                    } else {
                        resolve({
                            updated:true,
                            msg:'已经是最新版本!'
                        })
                    }
                }).catch((err) => {
                    reject('网络错误,或者更新失败! ' + err)
                });


            } else {
                reject('资源不存在!')
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
