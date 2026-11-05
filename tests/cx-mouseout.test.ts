import assert from 'node:assert/strict';
import { test } from 'node:test';
import { installChaoxingMouseoutGuard } from '../packages/scripts/src/utils/cx-mouseout';

const browserEnv = require('browser-env');

function fixture(path = '/mycourse/studentstudy') {
	const win = browserEnv([], { url: `https://mooc1.chaoxing.com${path}` });
	const target = win.document.createElement('div');
	const next = win.document.createElement('button');
	win.document.body.append(target, next);
	let calls = 0;
	// 模拟安装保护前已存在的页面监听器和 DOM0 处理器。
	win.document.addEventListener('mouseout', () => calls++);
	target.onmouseout = () => calls++;
	const dispatch = (type = 'mouseout', relatedTarget: EventTarget | null = null) => {
		target.dispatchEvent(new win.MouseEvent(type, { bubbles: true, relatedTarget }));
	};
	return { win, next, dispatch, calls: () => calls };
}

test('disabled by default and responds to the live setting', () => {
	const f = fixture();
	let enabled = false;
	const cleanup = installChaoxingMouseoutGuard(f.win, () => enabled);
	f.dispatch();
	assert.equal(f.calls(), 2);
	enabled = true;
	f.dispatch();
	assert.equal(f.calls(), 2);
	enabled = false;
	f.dispatch();
	assert.equal(f.calls(), 4);
	cleanup();
	f.win.close();
});

test('blocks document exit on study, task-card and video frame pages', () => {
	for (const path of [
		'/mycourse/studentstudy',
		'/mooc2-ans/mycourse/studentstudy',
		'/knowledge/cards',
		'/ananas/modules/video/index.html'
	]) {
		const f = fixture(path);
		const cleanup = installChaoxingMouseoutGuard(f.win, () => true);
		f.dispatch();
		assert.equal(f.calls(), 0, path);
		cleanup();
		f.win.close();
	}
});

test('preserves mouseout between elements, blur and visibilitychange', () => {
	const f = fixture();
	const cleanup = installChaoxingMouseoutGuard(f.win, () => true);
	f.dispatch('mouseout', f.next);
	assert.equal(f.calls(), 2);
	let otherCalls = 0;
	f.win.addEventListener('blur', () => otherCalls++);
	f.win.document.addEventListener('visibilitychange', () => otherCalls++);
	f.win.dispatchEvent(new f.win.Event('blur'));
	f.win.document.dispatchEvent(new f.win.Event('visibilitychange'));
	assert.equal(otherCalls, 2);
	cleanup();
	f.win.close();
});

test('leaves non-study pages untouched, including after history navigation', () => {
	for (const path of ['/work/doHomeWorkNew', '/exam/test', '/mycourse/studentstudy-other']) {
		const f = fixture(path);
		installChaoxingMouseoutGuard(f.win, () => true);
		f.dispatch();
		assert.equal(f.calls(), 2, path);
		f.win.close();
	}
	const f = fixture();
	const cleanup = installChaoxingMouseoutGuard(f.win, () => true);
	f.win.history.pushState({}, '', '/work/doHomeWorkNew');
	f.dispatch();
	assert.equal(f.calls(), 2);
	f.win.history.back();
	cleanup();
	f.win.close();
});

test('cleanup and repeated installation preserve existing listeners and native APIs', () => {
	const f = fixture();
	const originalAdd = f.win.EventTarget.prototype.addEventListener;
	const originalSet = f.win.Element.prototype.setAttribute;
	const cleanupOld = installChaoxingMouseoutGuard(f.win, () => true);
	const cleanup = installChaoxingMouseoutGuard(f.win, () => false);
	cleanupOld();
	f.dispatch();
	assert.equal(f.calls(), 2);
	cleanup();
	cleanup();
	f.dispatch();
	assert.equal(f.calls(), 4);
	assert.equal(f.win.EventTarget.prototype.addEventListener, originalAdd);
	assert.equal(f.win.Element.prototype.setAttribute, originalSet);
	f.win.close();
});
