import { StoreSchema } from ".";

const Store = require("electron-store");

export const store = new Store();

export function StoreGet<T extends keyof StoreSchema>(key: T): StoreSchema[T] {
    return store.get(key);
}

export function StoreSet<T extends keyof StoreSchema>(key: T, value: StoreSchema[T]) {
    store.set(key, value);
}
