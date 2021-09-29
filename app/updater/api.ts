import { AxiosGet } from "./axios"

const author = 'enncy'
const repo = 'online-course-script'
const reposBaseURL = `https://api.github.com/repos/${author}/${repo}`


export interface Release {
    [x: string]: any
    url: string,
    assets_url: string
    id: number,
    tag_name: string,
    name: string,
    publish_at: string
    assets: Assets[]
}

export interface Assets {
    [x: string]: any
    url: string,
    id: number,
    name: string,
    size: number,
    download_count: number,
    updated_at: string,
    browser_download_url: string
}


export async function getReleases(): Promise<Release[]> {
    const res = await AxiosGet({
        url: reposBaseURL + '/releases'
    })
    return res.data
}