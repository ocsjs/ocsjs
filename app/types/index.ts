import { ScriptRemote } from '../electron/router/scripts'

export * from './events'
export * from './store'
export * from './script/cx.login'
export * from './script/zhs.login'
export * from '../script/types'
 


export type ScriptRemoteType = typeof ScriptRemote
