import { Page } from 'playwright';
import { setting } from '..';

export async function waitForLogin(page: Page) {
	await Promise.race([page.waitForURL(/onlinestuh5/), page.waitForTimeout(setting.login.timeout)]);
}
