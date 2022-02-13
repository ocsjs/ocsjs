import { Page } from "playwright";
import { setting } from "../";

export async function waitForLogin(page: Page) {
    await Promise.race([page.waitForURL(/space\/index/), page.waitForTimeout(setting.login.timeout)]);
}
