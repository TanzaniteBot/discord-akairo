import EventEmitter from "events";

/**
 * Akairo Utilities.
 */
export default class Util {
	/**
	 * Choose the first non-null element in an array
	 * @param xs
	 */
	public static choice<T>(...xs: T[]): T | null {
		for (const x of xs) {
			if (x != null) {
				return x;
			}
		}

		return null;
	}

	/**
	 *
	 * @param o1
	 * @param os
	 */
	public static deepAssign(o1: any, ...os: any): any {
		for (const o of os) {
			for (const [k, v] of Object.entries(o)) {
				const vIsObject = v && typeof v === "object";
				const o1kIsObject = Object.prototype.hasOwnProperty.call(o1, k) && o1[k] && typeof o1[k] === "object";
				if (vIsObject && o1kIsObject) {
					Util.deepAssign(o1[k], v);
				} else {
					o1[k] = v;
				}
			}
		}

		return o1;
	}

	/**
	 *
	 * @param xs
	 * @param f
	 */
	public static flatMap(xs: any, f: any): any {
		const res = [];
		for (const x of xs) {
			res.push(...f(x));
		}

		return res;
	}

	/**
	 * Converts the supplied value into an array if it is not already one.
	 * @param x - Value to convert.
	 */
	public static intoArray<T>(x: T | T[]): T[] {
		if (Array.isArray(x)) {
			return x;
		}

		return [x];
	}

	/**
	 * Converts something to become callable.
	 * @param thing - What to turn into a callable.
	 */
	public static intoCallable<T>(thing: T | ((...args: any[]) => T)): (...args: any[]) => T {
		if (typeof thing === "function") {
			return thing as () => T;
		}

		return () => thing;
	}

	/**
	 * Checks if the supplied value is an event emitter.
	 * @param value - Value to check.
	 */
	public static isEventEmitter(value: any): value is EventEmitter {
		return value && typeof value.on === "function" && typeof value.emit === "function";
	}

	/**
	 * Checks if the supplied value is a promise.
	 * @param value - Value to check.
	 */
	public static isPromise(value: any): value is Promise<any> {
		return value && typeof value.then === "function" && typeof value.catch === "function";
	}

	/**
	 * Compares two prefixes.
	 * @param aKey - First prefix.
	 * @param bKey - Second prefix.
	 */
	public static prefixCompare(
		aKey: string | ((...args: any[]) => any),
		bKey: string | ((...args: any[]) => any)
	): number {
		if (aKey === "" && bKey === "") return 0;
		if (aKey === "") return 1;
		if (bKey === "") return -1;
		if (typeof aKey === "function" && typeof bKey === "function") return 0;
		if (typeof aKey === "function") return 1;
		if (typeof bKey === "function") return -1;
		return aKey.length === bKey.length ? aKey.localeCompare(bKey) : bKey.length - aKey.length;
	}
}
