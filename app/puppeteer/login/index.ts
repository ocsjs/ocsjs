
import { RunnableScript } from '@pioneerjs/core';
import { User } from "../../types";



export abstract class LoginScript extends RunnableScript {
    abstract run(): Promise<void>
    abstract login(user: User): Promise<void>
}





