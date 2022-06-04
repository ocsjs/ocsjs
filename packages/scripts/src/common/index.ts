import { Page } from 'playwright';

export async function openLink(page: Page, { url }: { url: string }) {
  await page.goto(url);
  return page;
}
