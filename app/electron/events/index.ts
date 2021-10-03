


export interface OCSEvents {
    info: string,
    warn: string,
    success: string,
    error: string,
}

export interface Notify {
    type: keyof OCSEvents,
    name: string
    title: string,
    message: string
}

export enum OCSEventTypes {

    // script

    CX = 'cx',
    CX_LOGIN = 'cx-login',

    ZHS = 'zhs',
    ZHS_LOGIN = 'zhs-login',
    // log

    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    SUCCESS = 'success',
    ERROR = 'error',
    NOTIFY = 'notify',
 

}

export enum IPCEventTypes {
    // remote

    REMOTE_GET = 'remote-get',
    REMOTE_SET = 'remote-set',
    REMOTE_CALL = 'remote-call',
    REMOTE_ON = 'remote-on',
    REMOTE_ONCE = 'remote-once',

    // other

    APP_UPDATE = 'app-update',
    CANCEL_APP_UPDATE = 'cancel-app-update',

    IS_NEED_UPDATE = 'is-need-update',
    SCRIPT_LOGIN = 'script-login',
}