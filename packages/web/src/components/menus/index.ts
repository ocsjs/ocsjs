import { ComputedRef } from "vue";

 
export interface MenuItem {
    icon?: string;
    title?: string;
    children?: MenuItem[];
    onClick?: (...args: any[]) => void;
    divide?: boolean;
    hide?: boolean | ComputedRef<boolean>;
    disable?: boolean | ComputedRef<boolean>;
}
