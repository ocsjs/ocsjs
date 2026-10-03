import assert from 'node:assert/strict';
import { test } from 'node:test';
import { expandAiChapterDirectory } from '../packages/scripts/src/projects/yuketang.directory';

require('browser-env')();

const timing = { intervalMs: 5, settleMs: 30, timeoutMs: 1000 };

function directory() {
	document.body.innerHTML = '<nav><div class="leaf-item is-active">current video</div></nav>';
	return document.querySelector('nav')!;
}

function chapter(parent: HTMLElement, onExpand: (children: HTMLElement) => void, expanded = false, legacy = false) {
	const container = document.createElement('div');
	const title = document.createElement('div');
	title.className = 'nav-item-title';
	const icon = document.createElement('i');
	icon.className = 'expand-icon';
	title.appendChild(icon);
	container.appendChild(title);
	parent.appendChild(container);
	let clicks = 0;
	const setExpanded = (value: boolean) => {
		if (legacy) icon.classList.toggle('is-expanded', value);
		else title.classList.toggle('is-expand', value);
	};
	setExpanded(expanded);
	icon.addEventListener('click', () => {
		clicks++;
		const open = legacy ? icon.classList.contains('is-expanded') : title.classList.contains('is-expand');
		setExpanded(!open);
		if (!open) onExpand(container);
	});
	return {
		title,
		icon,
		get clicks() {
			return clicks;
		}
	};
}

test('already expanded chapters stay open; collapsed chapters are clicked once', async () => {
	const root = directory();
	const open = chapter(root, () => {}, true);
	const closed = chapter(root, () => {});
	assert.equal(await expandAiChapterDirectory(root, timing), true);
	assert.equal(open.clicks, 0);
	assert.equal(closed.clicks, 1);
	assert.ok(open.title.classList.contains('is-expand'));
	assert.ok(closed.title.classList.contains('is-expand'));
});

test('waits for children rendered later than the old 100 ms interval', async () => {
	const root = directory();
	let child: ReturnType<typeof chapter> | undefined;
	chapter(root, (parent) => {
		setTimeout(() => {
			child = chapter(parent, (container) => {
				container.insertAdjacentHTML('beforeend', '<div class="leaf-item">next video</div>');
			});
		}, 160);
	});
	assert.equal(await expandAiChapterDirectory(root, { ...timing, settleMs: 200 }), true);
	assert.equal(child?.clicks, 1);
	assert.equal(root.querySelectorAll('.leaf-item').length, 2);
});

test('expands nested directories deeper than five levels', async () => {
	const root = directory();
	const nodes: ReturnType<typeof chapter>[] = [];
	const addLevel = (parent: HTMLElement, depth: number) => {
		nodes.push(
			chapter(parent, (children) => {
				if (depth < 7) addLevel(children, depth + 1);
				else children.insertAdjacentHTML('beforeend', '<div class="leaf-item">video</div>');
			})
		);
	};
	addLevel(root, 1);
	assert.equal(await expandAiChapterDirectory(root, timing), true);
	assert.equal(nodes.length, 7);
	assert.ok(nodes.every((node) => node.clicks === 1 && node.title.classList.contains('is-expand')));
	assert.equal(root.querySelectorAll('.leaf-item').length, 2);
});

test('also recognizes the legacy expansion marker on the icon', async () => {
	const root = directory();
	const open = chapter(root, () => {}, true, true);
	const closed = chapter(root, () => {}, false, true);
	assert.equal(await expandAiChapterDirectory(root, timing), true);
	assert.equal(open.clicks, 0);
	assert.equal(closed.clicks, 1);
});

test('can expand again after the user collapses a chapter between videos', async () => {
	const root = directory();
	const node = chapter(root, () => {});
	assert.equal(await expandAiChapterDirectory(root, timing), true);
	node.icon.click();
	assert.equal(await expandAiChapterDirectory(root, timing), true);
	assert.equal(node.clicks, 3);
	assert.ok(node.title.classList.contains('is-expand'));
});

test('flat directories with leaves need no expansion', async () => {
	const root = directory();
	root.innerHTML = '<div class="leaf-item">video</div>';
	assert.equal(await expandAiChapterDirectory(root, timing), true);
});

test('missing or unresponsive directories time out instead of reporting completion', async () => {
	const root = directory();
	root.innerHTML = '';
	assert.equal(await expandAiChapterDirectory(root, { ...timing, timeoutMs: 50 }), false);
	root.innerHTML =
		'<div class="leaf-item">current video</div><div class="nav-item-title"><i class="expand-icon"></i></div>';
	let clicks = 0;
	root.querySelector('.expand-icon')!.addEventListener('click', () => clicks++);
	assert.equal(await expandAiChapterDirectory(root, { ...timing, timeoutMs: 50 }), false);
	assert.equal(clicks, 1);
});

test('expanded headings without loaded leaves are not treated as a complete directory', async () => {
	const root = directory();
	root.innerHTML = '';
	chapter(root, () => {}, true);
	assert.equal(await expandAiChapterDirectory(root, { ...timing, timeoutMs: 50 }), false);
});
