import { chromium } from 'playwright';

const log = (message) => console.log(`[OCS Docker] [${new Date().toISOString()}] ${message}`);

log('Connecting to Chromium...');
const browser = await chromium.connectOverCDP('http://127.0.0.1:19222');
const context = browser.contexts()[0];
const page = context.pages()[0];

context.on('page', async (page) => {
	const url = page.url();
	log(`New page: ${url}`);
	if (url.includes('tampermonkey.net/index.php')) {
		log('Closing Tampermonkey homepage...');
		await page.close();
	} else if (url.match(/^chrome-extension:\/\/.*ask\.html.*$/)) {
		await page.click('input.button.install');
	}
});

log('Installing OCS script...');
const tempPage = await context.newPage();
await tempPage.goto('https://www.tampermonkey.net/script_installation.php#url=https://cdn.ocsjs.com/ocs.user.js');
await tempPage.close();

log('Navigating to startup URL...');
await page.goto(process.env.STARTUP_URL);
