import { RunnableScript, ScriptOptions } from "@pioneerjs/core";
import { BaseTask } from "../../electron/task/types";
import { LoginScriptType,  User } from "../../types";

 

/**
 * 登录脚本，抽象类
 */
export abstract class LoginScript   extends RunnableScript  implements LoginScriptType  {
   

    static scriptName: string;
    abstract login(task: BaseTask,user: User): Promise<any>;
 
}
