// playwright.config.ts
import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
    use: {
        headless: false,
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
        video: "off",
        locale: "zh-CN",
        launchOptions: {
            slowMo: 1000,
        },
    },
    workers: 1,
    timeout: 60 * 1000,
};
export default config;
