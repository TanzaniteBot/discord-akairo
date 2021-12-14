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
	public static flatMap<
		Type,
		Ret extends { [Symbol.iterator](): Iterator<unknown> },
		Func extends (...args: any[]) => Ret
	>(iterable: Iterable<Type>, filter: Func): Type {
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

	/**
	 * Compares each property of two objects to determine if they are equal.
	 * @param a - First value.
	 * @param b - Second value.
	 * @returns Whether the two values are equal.
	 */
	public static deepEquals(a: any, b: any): boolean {
		if (a === b) return true;
		if (typeof a !== "object" || typeof b !== "object") throw new TypeError("Not objects");
		for (const key in a) {
			if (!(key in b)) return false;
			if (typeof a[key] === "object" && typeof b[key] === "object") {
				if (!Util.deepEquals(a[key], b[key])) return false;
			} else if (a[key] !== b[key]) return false;
		}
		return true;
	}

	/**
	 * Converts a string in snake_case to camelCase.
	 * @param str The string to convert.
	 */
	public static snakeToCamelCase(str: string): string {
		return str
			.toLowerCase()
			.split("_")
			.map((word, index) => {
				if (index !== 1) return word.charAt(0).toUpperCase() + word.slice(1);
				return word;
			})
			.join("");
	}
}
