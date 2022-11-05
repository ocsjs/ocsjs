import { ConfigTagMap } from '../elements/configs/interface';

export interface Config {
	label: string;
	tag?: keyof ConfigTagMap;
	attrs?: Partial<ConfigTagMap[keyof ConfigTagMap]>;
	defaultValue?: any;
	/** 跨域设置 */
	cors?: boolean;
}
