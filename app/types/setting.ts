import { StoreSchema } from ".";

const Store = require("electron-store");

export const store = new Store();

export function StoreGet<T extends keyof StoreSchema>(key: T): StoreSchema[T] {
    const v = store.get(key)
    if(!v){
        throw new Error("设置读取失败！")
    }
    return v;
}

export function StoreSet<T extends keyof StoreSchema>(key: T, value: StoreSchema[T]) {
    store.set(key, value);
}
