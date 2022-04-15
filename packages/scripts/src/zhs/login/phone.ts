import { Page } from 'playwright';
import { setting } from '..';

export interface ZHSPhoneLoginOptions {
  phone: string
  password: string
}

export async function phoneLogin (page: Page, opts: ZHSPhoneLoginOptions) {
  const { phone, password } = opts;
  await page.goto(
    'https://passport.zhihuishu.com/login?service=https://onlineservice.zhihuishu.com/login/gologin#signin'
  );
  await page.fill('#lUsername', phone);
  await page.fill('#lPassword', password);
  await Promise.all([page.waitForNavigation({ timeout: setting.login.timeout }), page.click('.wall-sub-btn')]);

  return page;
}
