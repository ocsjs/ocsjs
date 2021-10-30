import EventEmitter from "events";

import { CurrentWindow } from "..";
import { OCSEventTypes, OCSEvents } from "../../types";
import { Logger,logger} from "../../types/logger"

/**
 * ocs公用事件处理器
 * 可以通过一个方法同时输出到本地
 *
 */
export class OCSEvent extends EventEmitter {
    logger: Logger;

    constructor(name: string) {
        super();
        this.logger = logger(name);
    }

    info(...msg: any[]) {
        this.logger.log(OCSEventTypes.INFO, msg);
        this.emit(OCSEventTypes.INFO, msg);
    }

    success(...msg: any[]) {
        this.logger.log(OCSEventTypes.SUCCESS, msg);
        this.emit(OCSEventTypes.SUCCESS, msg);
    }

    error(...msg: any[]) {
        console.error(msg);
        this.logger.log(OCSEventTypes.ERROR, msg);
        this.emit(OCSEventTypes.ERROR, msg);
    }

    warn(...msg: any[]) {
        console.log(msg);
        this.logger.log(OCSEventTypes.WARN, msg);
        this.emit(OCSEventTypes.WARN, msg);
    }

    onInfo(listener: eventHandler) {
        this.on(OCSEventTypes.INFO, listener);
    }

    onError(listener: eventHandler) {
        this.on(OCSEventTypes.ERROR, listener);
    }
    onSuccess(listener: eventHandler) {
        this.on(OCSEventTypes.SUCCESS, listener);
    }

    onWarning(listener: eventHandler) {
        this.on(OCSEventTypes.WARN, listener);
    }
}

type eventHandler = (msg: string[]) => void;

/**
 * 信息
 */
export class OCSMessage extends OCSEvent {
    constructor(public name: string) {
        super(name);
    }

    info(...msg: any[]) {
        super.info(...msg);
        sendToRender(OCSEventTypes.INFO, msg.join(","));
    }

    success(...msg: any[]) {
        super.info(...msg);
        sendToRender(OCSEventTypes.SUCCESS, msg.join(","));
    }

    error(...msg: any[]) {
        super.info(...msg);
        sendToRender(OCSEventTypes.ERROR, msg.join(","));
    }

    warn(...msg: any[]) {
        super.info(...msg);
        sendToRender(OCSEventTypes.WARN, msg.join(","));
    }
}

/**
 * 通知
 */
export class OCSNotify extends OCSEvent {
    constructor(public name: string, private title: string) {
        super(name);
    }

    notify({ type, message }: { type: keyof OCSEvents; message: any }) {
        const notify = { type, title: this.title, message, name: this.name };
        this.logger.log(OCSEventTypes.NOTIFY, notify);
        this.emit(OCSEventTypes.NOTIFY, notify);
        CurrentWindow?.webContents.send(OCSEventTypes.NOTIFY, notify);
    }

    info(...msg: any[]) {
        this.notify({ type: "info", message: msg });
    }

    success(...msg: any[]) {
        this.notify({ type: "success", message: msg });
    }

    error(...msg: any[]) {
        this.notify({ type: "error", message: msg });
    }

    warn(...msg: any[]) {
        this.notify({ type: "warn", message: msg });
    }
}

/**
 * 输出到前端渲染界面
 * @param eventName 事件名
 * @param event 具体参数
 */
export function sendToRender<T extends keyof OCSEvents>(eventName: T, event: OCSEvents[T]) {
    CurrentWindow?.webContents.send(eventName, event);
}
