
export interface WinSetting {
    isAlwaysOnTop: boolean
}

export interface PathSetting {
    userData: string
    logs: string
}

export interface SystemSetting {
    win:WinSetting
    path:PathSetting
}


