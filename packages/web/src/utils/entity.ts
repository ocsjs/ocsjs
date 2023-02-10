import { store } from '../store';

export function resetSearch() {
	store.render.browser.search.value = '';
	store.render.browser.search.tags = [];
}
