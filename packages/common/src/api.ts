import axios from 'axios';

export class OCSApi {
  static async getInfos(): Promise<{
    resource: {
      browser: string
      tampermonkey: string
      userjs: string
    }
    notify: {
      id: string
      content: string[]
    }[]
    versions: {
      tag: string
      description: Record<'feat' | 'fix' | 'other', string[]>
      url: string
    }[]
  }> {
    const { data } = await axios.get('https://cdn.ocs.enncy.cn/infos.json?t=' + Date.now());
    return data;
  }
}
