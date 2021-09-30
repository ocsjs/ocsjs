
import EventEmitter from "events";

import { Logger } from './log/log'
import { CurrentWindow } from './main'


export class ScriptEvent extends EventEmitter {

    log: Logger = new Logger(this.name)

    constructor(private name: string) {
        super();
    }

    info(...msg: string[]) {
        this.log.info(msg)
        this.emit('info', msg)
        CurrentWindow?.webContents.send('info', msg)
    }

    success(...msg: string[]) {
        this.log.info(msg)
        this.emit('success', msg)
        CurrentWindow?.webContents.send('success', msg)
    }

    error(...msg: string[]) {
        this.log.error(msg)
        this.emit('error', msg)
        CurrentWindow?.webContents.send('error', msg)
    }


    warn(...msg: string[]) {
        this.log.warn(msg)
        this.emit('warning', msg)
        CurrentWindow?.webContents.send('warning', msg)
    }


    onInfo(listener: eventHandler) {
        this.on('info', listener)
    }

    onError(listener: eventHandler) {
        this.on('error', listener)
    }
    onSuccess(listener: eventHandler) {
        this.on('success', listener)
    }

    onWarning(listener: eventHandler) {
        this.on('warning', listener)
    }
}

type eventHandler = (msg: string[]) => void