import { IpcMain } from "electron"
import path from "path"
import { IPCEventTypes } from "../../../types"
  
import { Updater } from "../updater"
import { JSDelivrUpdater } from "../updater/jsdelivr.updater"

 

const _path = path.resolve('./resources/resource.zip')

export async function UpdateRouter(ipcMain: IpcMain) {
    const updater: Updater = new JSDelivrUpdater(_path)
    // 注册服务
    ipcMain
        .on(IPCEventTypes.APP_UPDATE, async (e: Electron.IpcMainEvent, ms: number = 60 * 1000, tag?: string) => {
            updater.tag = tag
            await updater.update()
        }).on(IPCEventTypes.IS_NEED_UPDATE, async (e: Electron.IpcMainEvent, ms: number, tag?: string) => {
            e.returnValue = await updater.needUpdate()
        }).on(IPCEventTypes.CANCEL_APP_UPDATE, (e: Electron.IpcMainEvent) => {
            updater.APP_UPDATE.emit(IPCEventTypes.CANCEL_APP_UPDATE)
        })
}

