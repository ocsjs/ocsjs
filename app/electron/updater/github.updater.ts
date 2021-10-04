 
import { Octokit } from "@octokit/rest";
import { components } from '@octokit/openapi-types';
import yaml from 'yaml';
import { PathLike } from "fs";
import path from "path";

import { AxiosGet } from "./axios";
import { app } from "electron";
import { Updater, Version } from ".";

const { rest } = new Octokit();
const owner = 'enncy'
const repo = 'online-course-script';

export type Asset = components['schemas']['release-asset']

export class GitHubUpdater extends Updater {
    assets: Asset[] = []
    yml_assets?: Asset
    resource_assets?: Asset

    constructor(private path: string, tag?: string) {
        super(tag);
    }

    async init() {
        this.assets = await GitHubUpdater.initAssets(new Version(this.tag))
        this.yml_assets = GitHubUpdater.getLatestYml(this.assets)
        this.resource_assets = GitHubUpdater.getResourceZip(this.assets)
    }

    static async initAssets(tag?: Version) {
        // 获取 release
        let release = await GitHubUpdater.getRelease(tag)

        // 获取 assets
        const assets = await GitHubUpdater.getAssets(release.id)

        return assets
    }

    async update() {
        if (this.yml_assets && this.resource_assets) {
            let chunks = ''
            return await super.update((chunk: any) => {
                chunks += chunk
                this.APP_UPDATE.info('下载中 : ' + GitHubUpdater.showFomatSize(chunks.length) + "/" + GitHubUpdater.showFomatSize(this.resource_assets?.size || 0))

            })
        } else {
            this.APP_UPDATE.error('资源获取失败')
        }
    }


    resolvePath(): PathLike {
        return path.resolve(this.path);
    }
    async resolveResource(): Promise<URL | undefined> {
        try {
            // 获取 app-resource-zip
            const app_asset = GitHubUpdater.getResourceZip(this.assets)
            if (app_asset) {
                this.APP_UPDATE.info('正在更新中')
                return new URL(app_asset.browser_download_url)
            } else {
                this.APP_UPDATE.info("找不到最新版本的压缩包!", '请稍后再试');
            }
        } catch (err) {
            this.APP_UPDATE.error('更新失败!', err)
        }
    }



    /**
     * 获取最新 release ， 如果提供 tag 则根据 tag 获取
     * @param tag 
     * @returns 
     */
    static async getRelease(tag?: Version) {
        return (tag
            ? await rest.repos.getReleaseByTag({
                owner, repo, tag: tag.toString()
            })
            : await rest.repos.getLatestRelease({
                owner, repo,
            })).data
    }

    static async getAssets(release_id: number) {
        return (await rest.repos.listReleaseAssets({
            owner, repo,
            release_id
        })).data
    }


    static getLatestYml(assets: Asset[]) {
        return assets.find(a => a.name === 'latest.yml')
    }

    static getResourceZip(assets: Asset[]) {
        return assets.find(a => a.name === 'ocs-app-resource.zip')
    }


    /**
     * 判断是否需要更新
     * @param asset_id 
     * @returns 
     */
    async needUpdate() {
        try {
            if (this.yml_assets) {
                this.APP_UPDATE.info('正在获取远程最新版本号')
                const asset = await rest.repos.getReleaseAsset({
                    owner, repo,
                    asset_id: this.yml_assets.id,
                })

                const latest = await AxiosGet({
                    url: asset.data.browser_download_url,
                });

                const newversion = new Version(yaml.parse(latest.data).version)
                this.APP_UPDATE.info('最新远程版本号为 : ', newversion.value)
                return newversion.greaterThan(new Version(this.tag) || new Version(app.getVersion()))
            } else {
                this.APP_UPDATE.error('更新程序初始化失败!  资源 id 为空!')
            }

        } catch (err) {
            this.APP_UPDATE.error('检测是否需要更新失败! ', err)
        } finally {
            return true
        }

    }
}



