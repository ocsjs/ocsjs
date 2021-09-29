import { CXScript } from './puppeteer/cx/index';
import { BrowserConfig } from './config';
import path from 'path';
import { LoginType } from './puppeteer/cx/types';
import { StartPuppeteer } from './puppeteer';
import { BrowserWindow as BW } from 'electron';

// 在主进程中.
import { info, error } from 'electron-log';
import { app, BrowserWindow, ipcMain, shell, protocol } from 'electron';
require('update-electron-app')({
    repo: 'enncy/online-course-script',
    updateInterval: '10 minutes',
    logger: require('electron-log')
})


var mode = app.isPackaged ? 'prod' : 'dev'

export let CurrentWindow: BW | undefined = undefined

app.disableHardwareAcceleration()
app.whenReady().then(async () => {

    protocol.registerFileProtocol('app', (req: any, callback: any) => {
        const url = req.url.replace('app://', '')
        const resolve = path.normalize(path.resolve(`./resources/app`, url))
        info({ path: resolve });
        callback({ path: resolve })
    })

    CurrentWindow = await createWindow()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    app.on('window-all-closed', function () {
        if (process.platform !== 'darwin') app.quit()
    })
})






async function createWindow() {
    const win: any = new BrowserWindow(BrowserConfig)

    load()

    function load() {

        // Load a remote URL  
        const promise = mode === 'dev' ? win.loadURL('http://localhost:3000') : win.loadURL('app://./public/index.html')


        promise.then((result: any) => {
            win.show()
            if(mode.startsWith('dev')){
                win.webContents.openDevTools()
            } 
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

            ipcMain.on('run-script', () => {

                StartPuppeteer({
                    scripts: [CXScript],
                    async callback(browser: any, pioneer: any) {


                        const s = pioneer.runnableScripts?.find((s: { name: string; }) => s.name === 'cx')
                        if (s) {
                            const cx = s

                            await cx.index(LoginType['机构账号登录'])
                            await cx.login({
                                type: 3,
                                unitname: "广西大学行健文理学院",
                                uname: '18275719980',
                                password: 'skeleton132525'
                            }, {
                                username: 'enncy',
                                password: '132525'
                            })
                        }

                    }
                })
            })



            ipcMain.on('get', (event: any, arg: any[]) => {
                const property = arg[0]
                event.returnValue = win[property]
            })
            ipcMain.on('set', (event: any, arg: any[]) => {
                const [property, value] = [arg[0], arg[1]]

                event.returnValue = win[property] = value
            })

            ipcMain.on('call', (event: any, arg: any[]) => {
                const [property, ...value] = [arg.shift(), ...arg]
                event.returnValue = win[property](value)
            })

            ipcMain.on('on', (event: any, eventName: string) => {
                win.on(eventName.split('-')[0], () => event.reply(eventName))
            })

            ipcMain.on('once', (event: any, eventName: string) => {
                win.once(eventName.split('-')[0], () => event.reply(eventName))
            })
        }).catch((err: any) => {
            error(err);
            setTimeout(() => {
                load()
            }, 2000);
        });
    }


    return win

}




