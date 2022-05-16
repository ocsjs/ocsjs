import { Page } from 'playwright';
import { waitForLogin } from '../utils';

export async function otherLogin(page: Page) {
  await page.goto(
    'https://passport.zhihuishu.com/login'
  );
  await waitForLogin(page);
  return page;
}
