import { ZHSOtherLoginOptions } from "./other";
import { ZHSPhoneLoginOptions } from "./phone";
import { ZHSSchoolLoginOptions } from "./school";


export interface ZHSLoginOptions {
    phone: ZHSPhoneLoginOptions;
    school: ZHSSchoolLoginOptions;
    other: ZHSOtherLoginOptions;
}
