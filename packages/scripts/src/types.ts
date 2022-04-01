import { Page } from "playwright";

import { CXLoginOptions } from "./cx/types";
import { ZHSLoginOptions } from "./zhs/types";

export interface ScriptOptions {
    "cx-login-other": CXLoginOptions["other"];
    "cx-login-phone": CXLoginOptions["phone"];
    "cx-login-phone-code": CXLoginOptions["phoneCode"];
    "cx-login-school": CXLoginOptions["school"];
    "zhs-login-other": ZHSLoginOptions["other"];
    "zhs-login-phone": ZHSLoginOptions["phone"];
    "zhs-login-school": ZHSLoginOptions["school"];
}

export type ScriptFunction<Opts = any> = (page: Page, opts: Opts) => Promise<Page>;
