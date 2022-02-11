import { ZHSOtherLoginOptions } from "./other";
import { ZHSPhoneLoginOptions } from "./phone";
import { ZHSSchoolLoginOptions } from "./school";

export { phoneLogin } from "./phone";
export { schoolLogin } from "./school";
export { otherLogin } from "./other";

export interface ZHSLoginOptions {
    phone: ZHSPhoneLoginOptions;
    school: ZHSSchoolLoginOptions;
    other: ZHSOtherLoginOptions;
}

export const setting = {
    timeout: 30 * 1000,
};
