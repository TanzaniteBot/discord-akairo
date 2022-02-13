import EventEmitter from "events";
import type { PrefixSupplier } from "../struct/commands/CommandHandler";

/**
 * Akairo Utilities.
 */
export class Util {
	/**
	 * Deep assign properties to an object.
	 * @param target The object to assign values to.
	 * @param os The objects to assign from.
	 */
	public static deepAssign<A, B>(target: A, ...os: B[]): A {
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
	 * @returns - The callable.
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
	 * @returns - Whether the value is an event emitter.
	 */
	public static isEventEmitter(value: unknown): value is EventEmitter {
		return value instanceof EventEmitter;
	}

	/**
	 * Checks if the supplied value is a promise.
	 * @param value - Value to check.
	 * @returns - Whether the value is a promise.
	 */
	public static isPromise<T>(value: T | Promise<T>): value is Promise<T> {
		return value instanceof Promise;
	}

	/**
	 * Compares two prefixes.
	 * @param aKey - First prefix.
	 * @param bKey - Second prefix.
	 * @returns - Comparison result.
	 */
	public static prefixCompare(aKey: string | PrefixSupplier, bKey: string | PrefixSupplier): number {
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
	// eslint-disable-next-line complexity
	public static deepEquals(a: any, b: any, options?: DeepEqualsOptions): boolean {
		const { ignoreUndefined = true, ignoreArrayOrder = true } = options ?? {};

		if (a === b) return true;
		if (typeof a !== "object" || typeof b !== "object") throw new TypeError("Not objects");
		if ((Array.isArray(a) && !Array.isArray(b)) || (!Array.isArray(a) && Array.isArray(b))) return false;
		const newA = ignoreArrayOrder && Array.isArray(a) && a.length && typeof a[0] !== "object" ? [...a].sort() : a;
		const newB = ignoreArrayOrder && Array.isArray(b) && b.length && typeof b[0] !== "object" ? [...b].sort() : b;
		for (const key in newA) {
			if (ignoreUndefined && newA[key] === undefined && newB[key] === undefined) continue;
			if (!(key in newB)) return false;
			if (typeof newA[key] === "object" && typeof newB[key] === "object") {
				if (!this.deepEquals(newA[key], newB[key], { ignoreUndefined, ignoreArrayOrder })) return false;
			} else if (newA[key] !== newB[key]) return false;
		}
		for (const key in newB) {
			if (ignoreUndefined && newA[key] === undefined && newB[key] === undefined) continue;
			if (!(key in newA)) return false;
			if (typeof newB[key] === "object" && typeof newA[key] === "object") {
				if (!this.deepEquals(newA[key], newB[key], { ignoreUndefined, ignoreArrayOrder })) return false;
			} else if (newA[key] !== newB[key]) return false;
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
				if (index !== 0) return word.charAt(0).toUpperCase() + word.slice(1);
				return word;
			})
			.join("");
	}

	/**
	 * Converts a string in PascalCase to camelCase.
	 * @param str The string to convert.
	 */
	public static pascalToCamelCase(str: string): string {
		return str.charAt(0).toLowerCase() + str.slice(1);
	}

	/**
	 * Checks if `array` is an array and its elements are typeof of `type`
	 * @param array The array to check.
	 * @param type The type to check the elements' type against.
	 * @returns Whether the array is an array and its elements are typeof of `type`.
	 */
	public static isArrayOf<T>(
		array: T[],
		type: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"
	): boolean {
		if (!Array.isArray(array)) return false;
		return array.every(item => typeof item === type);
	}
}

/**
 * Checks if a value is a string, an array of strings, or a function
 * @internal
 */
export function isStringArrayStringOrFunc(value: any): value is string | string[] | ((...args: any[]) => any) {
	return typeof value === "string" || typeof value === "function" || Util.isArrayOf(value, "string");
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
