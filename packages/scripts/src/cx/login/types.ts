import { CXPhoneLoginOptions } from './phone';
import { CXPhoneCodeLoginOptions } from './phone.code';
import { CXSchoolLoginOptions } from './school';

export interface CXLoginOptions {
  phone: CXPhoneLoginOptions
  school: CXSchoolLoginOptions
  phoneCode: CXPhoneCodeLoginOptions
}
