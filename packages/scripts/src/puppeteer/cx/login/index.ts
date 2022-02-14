import { CXPhoneLoginOptions } from "./phone";
import { CXSchoolLoginOptions } from "./school";
import { CXOtherLoginOptions } from "./other";
import { CXPhoneCodeLoginOptions } from "./phone.code";

export { phoneCodeLogin } from "./phone.code";
export { phoneLogin } from "./phone";
export { schoolLogin } from "./school";
export { otherLogin } from "./other";

export interface CXLoginOptions {
    phone: CXPhoneLoginOptions;
    school: CXSchoolLoginOptions;
    other: CXOtherLoginOptions;
}
