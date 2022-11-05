import { ConfigTagMap } from '../elements/configs/interface';

export interface Config {
	label: string;
	type?: keyof ConfigTagMap;
	defaultValue?: any;
	/** 跨域设置 */
	cors?: boolean;
}
