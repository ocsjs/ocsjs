import EventEmitter from 'events';

export class CommonEventEmitter<E extends Record<string | symbol, (...args: any[]) => any>> extends EventEmitter {
	override on<K extends keyof E>(eventName: K, listener: E[K]): this {
		return super.on(eventName.toString(), listener);
	}

	override once<K extends keyof E>(eventName: K, listener: E[K]): this {
		return super.once(eventName.toString(), listener);
	}

	override emit<K extends keyof E>(eventName: K, ...args: Parameters<E[K]>): boolean {
		return super.emit(eventName.toString(), ...args);
	}

	override off<K extends keyof E>(eventName: K, listener: E[K]): this {
		return super.off(eventName.toString(), listener);
	}
}
