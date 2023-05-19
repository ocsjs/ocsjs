import { ConfigElement } from '../elements/config';
import { ConfigTagMap } from '../elements/configs/interface';

export interface Config<T extends keyof ConfigTagMap = keyof ConfigTagMap, V = any> {
	label?: string;
	tag?: T;
	attrs?: Partial<ConfigTagMap[T]>;
	defaultValue: V;
	/** 将本地修改后的值同步到元素中 */
	sync?: boolean;
	/** 在元素上方创建一个分隔元素 */
	separator?: string;
	onload?: (this: ConfigTagMap[T], el: ConfigElement<T>) => void;
}
