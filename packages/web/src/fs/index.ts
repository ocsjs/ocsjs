import { computed } from 'vue';
import { store } from '../store';
import { root } from './folder';

/** 当前所在的文件夹 */
export const currentFolder = computed(() => root().find('folder', store.render.browser.currentFolderUid) || root());

/** 当前文件夹的子文件 */
export const currentEntities = computed(() => currentFolder.value.children);

/** 当前编辑的浏览器 */
export const currentBrowser = computed(() => root().find('browser', store.render.browser.currentBrowserUid));

/** 当前搜索到的实体 */
export const currentSearchedEntities = computed(() => {
	if (store.render.browser.search.value === '' && store.render.browser.search.tags.length === 0) {
		return undefined;
	} else {
		console.log(store.render.browser.search.tags);

		return root().findAll(
			(e) =>
				(store.render.browser.search.value !== '' &&
					(e.name.indexOf(store.render.browser.search.value) !== -1 ||
						(e.type === 'browser' && e.notes.indexOf(store.render.browser.search.value) !== -1))) ||
				(store.render.browser.search.tags.length !== 0 &&
					store.render.browser.search.tags.some((t) => e.type === 'browser' && e.tags.some((et) => et.name === t)))
		);
	}
});
