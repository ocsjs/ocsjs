import { CXPhoneLoginOptions } from "./phone";
import { CXSchoolLoginOptions } from "./school";
import { CXOtherLoginOptions } from "./other";

export { phoneLogin } from "./phone";
export { schoolLogin } from "./school";
export { otherLogin } from "./other";

export interface CXLoginOptions {
    phone: CXPhoneLoginOptions;
    school: CXSchoolLoginOptions;
    other: CXOtherLoginOptions;
}

export const setting = {
    timeout: 30 * 1000,
};
