import { ConfigTagMap } from '../elements/configs/interface';

export interface Config<T extends keyof ConfigTagMap = keyof ConfigTagMap> {
	label?: string;
	tag?: T;
	attrs?: Partial<ConfigTagMap[T]>;
	defaultValue?: any;
	/** 将本地修改后的值同步到元素中 */
	sync?: boolean;
	onload?: (this: ConfigTagMap[T]) => void;
}
