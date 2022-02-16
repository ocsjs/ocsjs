import { Page } from "playwright";
import { StudyOptions, study as StudyVideo } from "../../browser/zhs/study";

/**
 * 视频学习
 * @param page
 * @param options {@link StudyOptions}
 */
export async function study(page: Page, options: StudyOptions) {
    await page.evaluate(
        ({ study, options }) => {
            study(options);
        },
        { study: StudyVideo, options }
    );
}
