import { Page } from 'playwright';
import { waitForLogin } from '../utils';

export interface CXPhoneCodeLoginOptions {
	phone: string;
}

export async function phoneCodeLogin(page: Page, opts: CXPhoneCodeLoginOptions) {
	const { phone } = opts;

	await page.goto('https://passport2.chaoxing.com/login?loginType=2&newversion=true');
	await page.fill('#phone', phone);
	await waitForLogin(page);
	return page;
}
