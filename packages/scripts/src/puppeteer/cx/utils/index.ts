import { Page } from "playwright";
import { setting } from "../login";

export async function waitForCXLogin(page: Page) {
    await Promise.race([page.waitForURL(/space\/index/), page.waitForTimeout(setting.timeout)]);
}
