import { RunnableScript } from "@pioneerjs/core";
import { LoginScriptType, User } from "../../types";




export abstract class LoginScript extends RunnableScript implements LoginScriptType{
    abstract login(user: User): Promise<void>
}
