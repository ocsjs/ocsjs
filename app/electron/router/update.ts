import { APP_UPDATE } from '../updater/auto.updater';

import { IpcMain } from "electron";
import { AutoUpdate, needUpdate } from "../updater/auto.updater";
import { IPCEventTypes } from "../events";



export function UpdateRouter(ipcMain: IpcMain) {
    // 注册服务
    ipcMain
        .on(IPCEventTypes.APP_UPDATE, (e: Electron.IpcMainEvent, ms: number = 60 * 1000, tag?: string) => {
            AutoUpdate(tag)
        }).on(IPCEventTypes.IS_NEED_UPDATE, async (e: Electron.IpcMainEvent, ms: number, tag?: string) => {
            e.returnValue = await needUpdate()
        }).on(IPCEventTypes.CANCEL_APP_UPDATE, (e: Electron.IpcMainEvent) => {
            APP_UPDATE.emit(IPCEventTypes.CANCEL_APP_UPDATE)
        })
}

