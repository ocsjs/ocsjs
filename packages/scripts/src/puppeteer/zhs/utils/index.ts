import { Page } from "playwright";
import { setting } from "../login";

export async function waitForZHSLogin(page: Page) {
    await Promise.race([page.waitForURL(/onlinestuh5/), page.waitForTimeout(setting.timeout)]);
}
