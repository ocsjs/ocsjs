export interface ChapterRetryState {
	chapterKey: string;
	unFinishCount: number | undefined;
	count: number;
}

/** 仅累计同一课程、班级、章节在任务点状态不变时的连续进入次数。 */
export function getChapterRetryState(
	doc: Document | undefined,
	previous?: ChapterRetryState | null
): ChapterRetryState | undefined {
	const chapter = doc?.querySelector<HTMLElement>('.posCatalog_active');
	if (
		!doc?.querySelector('.catalog_points_sa,.catalog_points_er') ||
		!chapter?.id ||
		chapter.querySelector('.icon_Completed')
	) {
		return;
	}

	const value = chapter.querySelector<HTMLInputElement>('.jobUnfinishCount')?.value.trim();
	const unFinishCount = value && /^\d+$/.test(value) ? Number(value) : undefined;
	if (unFinishCount === 0) {
		return;
	}

	const chapterKey = JSON.stringify([
		doc.querySelector<HTMLInputElement>('#curCourseId')?.value,
		doc.querySelector<HTMLInputElement>('#curClazzId')?.value,
		chapter.id
	]);
	const count =
		previous?.chapterKey === chapterKey && previous.unFinishCount === unFinishCount && previous.count < 3
			? previous.count + 1
			: 1;

	return { chapterKey, unFinishCount, count };
}
