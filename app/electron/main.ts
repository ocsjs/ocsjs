
import { BrowserConfig } from '../electron/config';
import path from 'path';
import { BrowserWindow as BW } from 'electron';

// 在主进程中.
import { info, error } from 'electron-log';
import { app, BrowserWindow, ipcMain, shell, protocol } from 'electron';
import { RemoteRouter } from './router/remote';
import { ScriptsRouter } from './router/scripts';
import { UpdateRouter } from './router/update';

// 判断开发环境
var mode = app.isPackaged ? 'prod' : 'dev'

info("开发环境:" + mode);


export let CurrentWindow: BW | undefined = undefined

app.disableHardwareAcceleration()
app.whenReady().then(async () => {
    // 注册协议
    protocol.registerFileProtocol('app', (req: any, callback: any) => {
        const url = req.url.replace('app://', '')
        const resolve = path.normalize(path.resolve(`./resources/app`, url))
        info({ path: resolve });
        callback({ path: resolve })
    })


    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    app.on('window-all-closed', function () {
        if (process.platform !== 'darwin') app.quit()
    })


    CurrentWindow = await createWindow()
 
})






async function createWindow() {
    const win: any = new BrowserWindow(BrowserConfig)

    load()

    function load() {
        
        // Load a remote URL  
        const promise = mode === 'dev' ? win.loadURL('http://localhost:3000') : win.loadURL('app://./public/index.html')
 

        promise.then((result: any) => {
            win.show()
            info("show");
            win.webContents.openDevTools()
            // 拦截页面跳转
            win.webContents.on('will-navigate', (e: { preventDefault: () => void; }, url: any) => {
                e.preventDefault()
                shell.openExternal(url)
            })
            win.webContents.setWindowOpenHandler((data: { url: any; }) => {
                shell.openExternal(data.url)
                return {
                    action: 'deny'
                }
            })
            info("register router");
            UpdateRouter(ipcMain)
            ScriptsRouter(ipcMain)
            RemoteRouter(ipcMain)

        }).catch((err: any) => {
            error(err);
            setTimeout(() => {
                load()
            }, 2000);
        });
    }


    return win

}




