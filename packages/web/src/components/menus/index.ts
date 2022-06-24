import { ComputedRef } from 'vue';

export interface MenuItem<T = any> {
	icon?: string;
	title?: string;
	children?: MenuItem<T>[];
	onClick?: (item: T) => void;
	divide?: boolean;
	hide?: boolean | ComputedRef<boolean>;
	disable?: boolean | ComputedRef<boolean>;
}
