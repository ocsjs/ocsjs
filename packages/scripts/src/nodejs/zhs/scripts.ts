import { Page } from "playwright";
import { study as StudyVideo } from "../../browser/zhs/study";

/**
 * 视频学习
 * @param page
 * @param settings
 */
export async function study(page: Page, settings: any) {
    await page.evaluate(
        ({ study, settings }) => {
            study(settings);
        },
        { study: StudyVideo, settings }
    );
}
