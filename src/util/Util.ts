/* eslint-disable @typescript-eslint/ban-types */
import type EventEmitter from "events";

/**
 * Akairo Utilities.
 */
export default class Util {
	/**
	 * Deep assign properties to an object.
	 * @param target
	 * @param os
	 */
	public static deepAssign<A, B>(target: A, ...os: B[]) {
		for (const o of os) {
			for (const [key, value] of Object.entries(o)) {
				const valueIsObject = value && typeof value === "object";
				const targetKeyIsObject =
					Object.prototype.hasOwnProperty.call(target, key) &&
					target[key as keyof typeof target] &&
					typeof target[key as keyof typeof target] === "object";
				if (valueIsObject && targetKeyIsObject) {
					Util.deepAssign(target[key as keyof typeof target], value);
				} else {
					target[key as keyof typeof target] = value;
				}
			}
		}

		return target;
	}

	/**
	 * Map an iterable object and then flatten it it into an array
	 * @param iterable - the object to map and flatten
	 * @param filter - the filter to map with
	 */
	public static flatMap<Type, Ret extends { [Symbol.iterator](): Iterator<unknown> }, Func extends (...args: any[]) => Ret>(
		iterable: Iterable<Type>,
		filter: Func
	): Type {
		const result = [];
		for (const x of iterable) {
			result.push(...filter(x));
		}

		return result as unknown as Type;
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
	public static isPromise<T>(value: T | Promise<T>): value is Promise<T>;
	public static isPromise(value: any): value is Promise<any> {
		return value && typeof value.then === "function" && typeof value.catch === "function";
	}

	/**
	 * Compares two prefixes.
	 * @param aKey - First prefix.
	 * @param bKey - Second prefix.
	 */
	public static prefixCompare(aKey: string | ((...args: any[]) => any), bKey: string | ((...args: any[]) => any)): number {
		if (aKey === "" && bKey === "") return 0;
		if (aKey === "") return 1;
		if (bKey === "") return -1;
		if (typeof aKey === "function" && typeof bKey === "function") return 0;
		if (typeof aKey === "function") return 1;
		if (typeof bKey === "function") return -1;
		return aKey.length === bKey.length ? aKey.localeCompare(bKey) : bKey.length - aKey.length;
	}

	/**
	 * Compares each property of two objects to determine if they are equal.
	 * @param a - First value.
	 * @param b - Second value.
	 * @param ignoreUndefined - Whether to ignore undefined properties.
	 * @returns Whether the two values are equal.
	 */
	public static deepEquals<T>(a: unknown, b: T, options?: DeepEqualsOptions): a is T;
	/* eslint-disable no-console */
	// eslint-disable-next-line complexity
	public static deepEquals(a: any, b: any, options?: DeepEqualsOptions): boolean {
		const { ignoreUndefined = true, ignoreArrayOrder = true } = options ?? {};

		if (a === b) return true;
		if (typeof a !== "object" || typeof b !== "object") throw new TypeError("Not objects");
		if ((Array.isArray(a) && !Array.isArray(b)) || (!Array.isArray(a) && Array.isArray(b))) {
			console.debug("deepEquals: Array vs non-array");
			return false;
		}
		const newA =
			ignoreArrayOrder && Array.isArray(a) && a.length && typeof a[0] === "string"
				? [...a].sort((aa, bb) => {
						if (aa < bb) return -1;
						if (aa > bb) return 1;
						return 0;
				  })
				: a;
		const newB =
			ignoreArrayOrder && Array.isArray(b) && b.length && typeof b[0] === "string"
				? [...b].sort((aa, bb) => {
						if (aa < bb) return -1;
						if (aa > bb) return 1;
						return 0;
				  })
				: b;
		for (const key in newA) {
			if (ignoreUndefined && newA[key] === undefined && newB[key] === undefined) continue;
			if (!(key in newB)) {
				console.log("======================================");
				console.dir(newA, { depth: 4 });
				console.dir(newB, { depth: 4 });
				return false;
			}
			if (typeof newA[key] === "object" && typeof newB[key] === "object") {
				if (!this.deepEquals(newA[key], newB[key], { ignoreUndefined, ignoreArrayOrder })) return false;
			} else if (newA[key] !== newB[key]) {
				console.log("======================================");
				console.dir(newA[key], { depth: 4 });
				console.dir(newA, { depth: 4 });
				console.dir(newB[key], { depth: 4 });
				console.dir(newB, { depth: 4 });
				return false;
			}
		}
		return true;
	}
	/* eslint-enable no-console */

	/**
	 * Converts a string in snake_case to camelCase.
	 * @param str The string to convert.
	 */
	public static snakeToCamelCase(str: string): string {
		return str
			.toLowerCase()
			.split("_")
			.map((word, index) => {
				if (index !== 0) return word.charAt(0).toUpperCase() + word.slice(1);
				return word;
			})
			.join("");
	}
}

export interface DeepEqualsOptions {
	/**
	 * Whether to ignore undefined properties.
	 * @default true
	 */
	ignoreUndefined?: boolean;

	/**
	 * Whether to ignore the order of the items in arrays
	 * @default true
	 */
	ignoreArrayOrder?: boolean;
}
