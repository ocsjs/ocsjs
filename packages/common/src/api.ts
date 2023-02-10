import axios from 'axios';

/** 通知信息 */
export interface NotifyResource {
	id: string;
	content: string[];
}

/** 浏览器拓展信息 */
export interface ExtensionResource {
	name: string;
	icon: string;
	homepage: string;
	url: string;
}

/** 版本更新信息 */
export interface UpdateInformationResource {
	tag: string;
	description: Record<'feat' | 'fix' | 'other', string[]>;
	url: string;
}

/** 官方书签信息 */
export interface BookmarkResource {
	values: {
		name: string;
		url: string;
	}[];
	group: string;
}

export interface Infos {
	resource: {
		userjs: string;
	};
	extensions: ExtensionResource[];
	bookmark: BookmarkResource[];
	notify: NotifyResource[];
	versions: UpdateInformationResource[];
}

export class OCSApi {
	static async getInfos(): Promise<Infos> {
		const { data } = await axios.get('https://cdn.ocsjs.com/infos.json?t=' + Date.now());
		return data;
	}
}
