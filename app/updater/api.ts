import { AxiosGet } from "./axios"
import { get } from 'request';
const repo = 'online-course-script'
const reposBaseURL = `https://cdn.jsdelivr.net/npm/${repo}`

export async function getVersion(): Promise<string> {
    const { data } = await AxiosGet({
        url: reposBaseURL + '/package.json'
    })
    return data.version
}

export async function getResource(version?: string) {
    const { data } = await AxiosGet({
        url: reposBaseURL + (version ? '@' + version : '') + '/resource/ocs-app-resources.zip',
        responseType: 'stream'
    })
    return data
}