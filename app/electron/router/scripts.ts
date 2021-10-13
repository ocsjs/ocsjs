

import { getCourse, StartPuppeteer } from '../../script/index';
import { AllScriptObjects } from '../../script/types';
import { User } from '../../types';
import { Course } from '../../types/script/course';




export const ScriptRemote = {
    login(name: keyof AllScriptObjects, user: User): Promise<Course[] | undefined> {
        return new Promise((resolve) => {
            StartPuppeteer<any>(name, async (script) => {
                if (script) {
                    console.log("user", user);
                    console.log("script", name);
                    await script.login(user)
                    const c = await getCourse(script)
                    console.log("getCourse",c);
                    
                    resolve(c)
                }
            })
        });
    }
}



