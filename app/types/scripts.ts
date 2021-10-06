 
export interface ScriptTypes {
    cx: string,
    zhs: string
}





export interface CourseScript {

    index(...args: any[]): any

    login(...args: any[]): any

}

export interface Script {
    // find element
    find(...args: any[]): any
    // execute script
    execute(...args: any[]): any

}


export interface VideoScript extends Script {
    title: string
    url: string
    autoMute: boolean
    maxPlaybackRate: number
    playbackRate: number
    currentTime: number
    totalDuration: number

    play(...args: any[]): any
    pause(...args: any[]): any
    setPlaybackRate(...args: any[]): any
    update(...args: any[]): any
    mute(...args: any[]): any
}


// Question and Answer script
export interface QAScript extends Script {
    type: 'multiple' | 'single' | 'judgment' | 'completion'
    title: string,
    options: string[]
    getAnswer(...args: any[]): any
    answer(...args: any[]): any
}



export interface OCROptions {
    username: string,
    password: string,
    typeid?: string
}