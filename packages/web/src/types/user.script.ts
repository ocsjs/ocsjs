export interface CommonUserScript {
	id: number;
	url: string;
	name: string;
	code_url: string;
	license: string;
	version: string;
	description: string;
	authors: {
		name: string;
		url: string;
		avatar?: string;
	}[];
	/** 评分 */
	ratings: number;
	daily_installs: number;
	total_installs: number;
	createTime: number;
	updateTime: number;
}

export interface GreasyForkUserScript {
	id: number;
	created_at: string;
	daily_installs: number;
	total_installs: number;
	code_updated_at: string;
	bad_ratings: number;
	ok_ratings: number;
	good_ratings: number;
	users: {
		id: number;
		name: string;
		url: string;
	}[];
	name: string;
	description: string;
	url: string;
	code_url: string;
	license: string;
	version: string;
}

export interface ScriptCatUserScript {
	username: string;
	avatar: string;
	user_id: number;
	score: number;
	script: {
		meta: string;
		meta_json: Record<string, string[]>;
		script_id: number;
		version: string;
	};
	id: number;
	name: string;
	description: string;
	today_install: number;
	total_install: number;
	createtime: number;
	updatetime: number;
}

export interface LocalUserScript {
	path: string;
	filename: string;
	createtime: number;
}
