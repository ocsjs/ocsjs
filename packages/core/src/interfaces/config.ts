import { ConfigElement } from '../elements/config';
import { ConfigTagMap } from '../elements/configs/interface';

export interface Config<T extends keyof ConfigTagMap = keyof ConfigTagMap, V = any>
	extends Partial<Pick<ConfigElement<T>, 'tag' | 'attrs' | 'options'>> {
	defaultValue: V;
	label?: string;
	/** 将本地修改后的值同步到元素中 */
	sync?: boolean;
	/** 在元素上方创建一个分隔元素 */
	separator?: string;
	/** 元素加载回调 */
	onload?: (this: ConfigTagMap[T], el: ConfigElement<T>) => void;
	/**
	 * 额外的数据，可以由程序自定义并解析
	 */
	extra?: any;
}
