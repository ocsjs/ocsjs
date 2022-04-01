
import { CXPhoneLoginOptions } from "./phone";
import { CXSchoolLoginOptions } from "./school";
import { CXOtherLoginOptions } from "./other";
import { CXPhoneCodeLoginOptions } from "./phone.code";


export interface CXLoginOptions {
    phone: CXPhoneLoginOptions;
    school: CXSchoolLoginOptions;
    other: CXOtherLoginOptions;
    phoneCode: CXPhoneCodeLoginOptions;
}
