import { Status } from './status.types';
import EventEmitter from "events";

import { Logger } from './log';
import { CurrentWindow } from '../../main';


export class ScriptEvent extends EventEmitter {

    log: Logger = new Logger(this.name)

    constructor(private name: string) {
        super();
    }


    info(status: Status, msg: string = '') {
        this.log.info({ status: Status[status], msg })
        this.emit('info', Status[status], msg)
        CurrentWindow?.webContents.send('info', Status[status], msg)
    }

    success(status: Status, msg: string = '') {
        this.log.info({ status: Status[status], msg })
        this.emit('success', Status[status], msg)
        CurrentWindow?.webContents.send('success', Status[status], msg)
    }

    error(status: Status, msg: string = '') {
        this.log.error({ status: Status[status], msg })
        this.emit('error', Status[status], msg)
        CurrentWindow?.webContents.send('error', Status[status], msg)
    }


    warn(status: Status, msg: string = '') {
        this.log.warn({ status: Status[status], msg })
        this.emit('warning', Status[status], msg)
        CurrentWindow?.webContents.send('warning', Status[status], msg)
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

type eventHandler = (status: Status, msg?: string) => void