/** pnpm test:cx-chapter：使用本地章节目录验证重复进入检测，不访问学习平台。 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ChapterRetryState, getChapterRetryState } from '../packages/scripts/src/utils/cx-chapter';

function page(
	options: {
		chapter?: string;
		course?: string;
		clazz?: string;
		unfinished?: string;
		completed?: boolean;
		specialMode?: boolean;
	} = {}
) {
	document.body.innerHTML = `
		<input id="curCourseId" value="${options.course ?? 'course-a'}">
		<input id="curClazzId" value="${options.clazz ?? 'class-a'}">
		${options.specialMode === false ? '' : '<span class="catalog_points_sa"></span>'}
		<div class="posCatalog_active" id="${options.chapter ?? 'chapter-a'}">
			${options.completed ? '<span class="icon_Completed"></span>' : ''}
			${options.unfinished === undefined ? '' : `<input class="jobUnfinishCount" value="${options.unfinished}">`}
		</div>`;
}

function visit(times: number, previous?: ChapterRetryState): ChapterRetryState | undefined {
	let state = previous;
	for (let i = 0; i < times; i++) {
		// 模拟 GM 标签页存储跨页面加载时的序列化。
		state = getChapterRetryState(document, JSON.parse(JSON.stringify(state ?? null)));
	}
	return state;
}

test('已完成的章节重复进入时不报警，并清除旧计数', () => {
	page({ unfinished: '1' });
	const previous = visit(2);
	page({ unfinished: '1', completed: true });
	assert.equal(visit(3, previous), undefined);
});

test('任务点剩余数为零时不报警，即使完成图标尚未刷新', () => {
	page({ unfinished: '1' });
	const previous = visit(2);
	page({ unfinished: '0' });
	assert.equal(visit(3, previous), undefined);
});

test('同一未完成章节连续第三次进入时仍会触发保护', () => {
	page({ unfinished: '1' });
	assert.equal(visit(2)?.count, 2);
	assert.equal(visit(3)?.count, 3);
});

test('任务点进度发生变化后重新计数', () => {
	page({ unfinished: '3' });
	const previous = visit(2);
	page({ unfinished: '2' });
	const progress = visit(1, previous);
	assert.equal(progress?.count, 1);
	assert.equal(visit(2, progress)?.count, 3);
});

test('切换章节后返回时不累计历史进入次数', () => {
	page({ unfinished: '1' });
	const previous = visit(2);
	page({ chapter: 'chapter-b', unfinished: '1' });
	const otherChapter = visit(1, previous);
	page({ unfinished: '1' });
	assert.equal(visit(1, otherChapter)?.count, 1);
});

test('章节 ID 相同时仍隔离不同课程和班级', () => {
	for (const options of [{ course: 'course-b' }, { clazz: 'class-b' }]) {
		page({ unfinished: '1' });
		const previous = visit(2);
		page({ ...options, unfinished: '1' });
		assert.equal(visit(1, previous)?.count, 1);
	}
});

test('离开特殊模式时清除计数，普通课程不报警', () => {
	page({ unfinished: '1' });
	const previous = visit(2);
	page({ unfinished: '1', specialMode: false });
	assert.equal(visit(3, previous), undefined);
});

test('目录或当前章节尚未加载时不报警', () => {
	assert.equal(getChapterRetryState(undefined), undefined);
	document.body.innerHTML = '<span class="catalog_points_sa"></span>';
	assert.equal(visit(3), undefined);
	page({ chapter: '', unfinished: '1' });
	assert.equal(visit(3), undefined);
});

test('未提供或提供无效任务点数量时，不将未知状态当作已完成', () => {
	for (const unfinished of [undefined, '', 'unknown']) {
		page({ unfinished });
		const state = visit(3);
		assert.equal(state?.unFinishCount, undefined);
		assert.equal(state?.count, 3);
	}
});

test('解锁模式同样保留重复进入保护', () => {
	page({ unfinished: '1' });
	document.querySelector('.catalog_points_sa')!.className = 'catalog_points_er';
	assert.equal(visit(3)?.count, 3);
});

test('其他章节的完成图标不影响当前未完成章节的判断', () => {
	page({ unfinished: '1' });
	document.body.insertAdjacentHTML('beforeend', '<div><span class="icon_Completed"></span></div>');
	assert.equal(visit(3)?.count, 3);
});

test('提示后重新开始一个检测周期，避免下一次进入立即再次报警', () => {
	page({ unfinished: '1' });
	const stopped = visit(3);
	assert.equal(visit(1, stopped)?.count, 1);
});
