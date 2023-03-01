import { GMStoreProvider, ObjectStoreProvider, StoreProvider } from '../interfaces/store.provider';
export { GMStoreProvider, ObjectStoreProvider } from '../interfaces/store.provider';
export const $store: StoreProvider =
	typeof globalThis.unsafeWindow === 'undefined' ? new ObjectStoreProvider() : new GMStoreProvider();
