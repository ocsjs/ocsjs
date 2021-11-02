import { RunnableScript } from "@pioneerjs/core";
import { Task } from "../../electron/task";
import { BaseTask, TaskType } from "../../electron/task/types";
import { LoginScriptType,  User } from "../../types";

 

/**
 * 登录脚本，抽象类
 */
export abstract class LoginScript   extends RunnableScript  implements LoginScriptType  {
  
    static scriptName: string;
    abstract login(task: TaskType , user: User): Promise<any>;
 
}
