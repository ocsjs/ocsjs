import { AxiosGet } from './axios';
import { log } from 'electron-log';
import { app } from "electron";
import { ClientRequest } from "http";
import { SemVer } from "semver";
import semver from "semver";
import path from 'path';
import fs from 'fs';
import { IPCEventTypes } from "../../types";
import { OCSNotify } from "../events/ocs.event";
import compressing from 'compressing';
/**
 * 更新类
 */
export abstract class Updater {
    APP_UPDATE = new OCSNotify(IPCEventTypes.APP_UPDATE, "更新程序")

    constructor(public tag?: string) { }

    // 初始化
    async init(): Promise<void> { }

    //更新
    public async update(callback?: (chunk: any) => void): Promise<ClientRequest | undefined> {
        if (app.isPackaged) {
            await this.init();
            // 写入数据
            const url = await this.resolveResource()
            this.APP_UPDATE.info('开始下载远程更新文件', url?.href)
            const file = this.resolvePath()
            this.APP_UPDATE.info('创建本地更新文件', file)
            if (url) {
                try {
                    const { data } = await AxiosGet({ url: url.href, responseType: 'stream' })// request(url.href)

                    // 获取本地写入流
                    const output = fs.createWriteStream(file)
                    this.APP_UPDATE.info('创建本地写入流', file)
                    this.APP_UPDATE.once(IPCEventTypes.CANCEL_APP_UPDATE, () => {
                        data.destroy()
                    })
                    data.pipe(output)
                    data.on('data', (chunk: any) => {
                        callback?.(chunk)
                    });

                    data.on('close', () => {
                        this.APP_UPDATE.info('正在解压更新文件')
                        compressing.zip.uncompress(file.toString(), path.resolve(path.join(file.toString(), '../app/')))
                            .then((result) => {
                                this.APP_UPDATE.success('更新完毕,请重启软件!')
                            }).catch((err) => {
                                this.APP_UPDATE.info('更新失败', err.stack)
                            });
                    })
                    return data
                } catch (err: any) {
                    this.APP_UPDATE.error('更新失败', err.stack)
                }
            } else {
                this.APP_UPDATE.error('更新路径解析失败')
            }
        } else {
            this.APP_UPDATE.warn('当前不是生产模式，不能进行更新操作')
        }

    }

    // 是否需要更新
    abstract needUpdate(): Promise<boolean>
    // 提供本地保存路径
    abstract resolvePath(): fs.PathLike
    // 提供远程下载路径
    abstract resolveResource(): Promise<URL | undefined>


    static showFomatSize(size: number) {
        return size > 1024
            ? size > 1024 * 1024
                ? (size / (1024 * 1024)).toFixed(2) + 'MB'
                : (size / 1024).toFixed(2) + 'KB'
            : size + 'Byte'
    }
}



/**
 * 版本号类
 */
export class Version {

    private _value: SemVer;

    public get value(): SemVer {
        return this._value;
    }
    public set value(value: SemVer) {
        this._value = value;
    }

    constructor(version?: string) {
        const v = version || app.getVersion()
        this._value = new SemVer(semver.valid(semver.coerce(semver.clean(v, { loose: true }))) || v)
    }
    lessThan(v: Version) {
        return semver.lt(this.value, v.value)
    }
    greaterThan(v: Version) {
        return semver.gt(this.value, v.value)
    }

    toString() {
        return this.value.raw
    }
}