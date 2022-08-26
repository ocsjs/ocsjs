import axios from 'axios';

export class OCSApi {
	static async getInfos(): Promise<{
		extensions: {
			name: string;
			icon: string;
			homepage: string;
			url: string;
		}[];
		notify: {
			id: string;
			content: string[];
		}[];
		versions: {
			tag: string;
			description: Record<'feat' | 'fix' | 'other', string[]>;
			url: string;
		}[];
	}> {
		const { data } = await axios.get('https://cdn.ocsjs.com/infos.json?t=' + Date.now());
		return data;
	}
}
