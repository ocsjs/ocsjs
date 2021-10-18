import { RunnableScript } from "@pioneerjs/core";
import { LoginScriptType, User } from "../../types";

/**
 * 超星登录脚本，抽象类
 */
export abstract class LoginScript
    extends RunnableScript
    implements LoginScriptType
{
    abstract login(user: User): Promise<void>;
}
