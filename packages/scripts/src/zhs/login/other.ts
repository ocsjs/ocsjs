import { Page } from 'playwright';
import { waitForLogin } from '../utils';

export async function otherLogin(page: Page) {
  await page.goto(
    'https://passport.zhihuishu.com/login?service=https://onlineservice.zhihuishu.com/login/gologin#signin'
  );
  await waitForLogin(page);
  return page;
}
