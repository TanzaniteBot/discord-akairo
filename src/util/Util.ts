import EventEmitter from "node:events";
import util from "node:util";
import type { PrefixSupplier } from "../struct/commands/CommandHandler.js";
import { SyncOrAsync } from "../typings/Util.js";
import { AkairoError } from "./AkairoError.js";

/**
 * Deep assign properties to an object.
 * @param target The object to assign values to.
 * @param os The objects to assign from.
 */
export function deepAssign<A extends Record<string, any>, B extends Record<string, any>>(target: A, ...os: B[]): A & B {
	for (const o of os) {
		for (const [key, value] of Object.entries(o) as [keyof typeof o & keyof typeof target, any][]) {
			const valueIsObject = value && typeof value === "object";
			const targetKeyIsObject = Object.hasOwn(target, key) && target[key] && typeof target[key] === "object";
			if (valueIsObject && targetKeyIsObject) {
				deepAssign(target[key], value);
			} else {
				target[key] = value;
			}
		}
	}

	return target as A & B;
}

/**
 * Converts the supplied value into an array if it is not already one.
 * @param x - Value to convert.
 */
export function intoArray<T>(x: T | T[]): T[] {
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
export function intoCallable<T>(thing: T | ((...args: any[]) => T)): (...args: any[]) => T {
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
export function isEventEmitter(value: unknown): value is EventEmitter;
export function isEventEmitter(value: any): value is EventEmitter {
	return Boolean(value) && typeof value.on === "function" && typeof value.emit === "function";
}

/**
 * Checks if the supplied value is a promise.
 * @param value - Value to check.
 * @returns - Whether the value is a promise.
 */
export function isPromise<T>(value: SyncOrAsync<T>): value is Promise<T> {
	return util.types.isPromise(value);
}

/**
 * Compares two prefixes.
 * @param aKey - First prefix.
 * @param bKey - Second prefix.
 * @returns - Comparison result.
 */
export function prefixCompare(aKey: string | PrefixSupplier, bKey: string | PrefixSupplier): number {
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
 * @param options - Additional options.
 * @returns Whether the two values are equal.
 */
export function deepEquals<T>(a: unknown, b: T, options?: DeepEqualsOptions): a is T;
// eslint-disable-next-line complexity
export function deepEquals(a: any, b: any, options?: DeepEqualsOptions): boolean {
	const { ignoreUndefined = true, ignoreArrayOrder = true } = options ?? {};

	if (Object.is(a, b)) return true;
	else if ((typeof a !== "object" || a === null) && (typeof b !== "object" || b === null)) return false;
	else if (typeof a !== typeof b && (typeof a === "object" || typeof b === "object")) return false;
	else if (typeof a === typeof b && (a === null || b === null)) return false;
	if (typeof a !== "object" || typeof b !== "object") throw new TypeError("Not objects");
	if ((Array.isArray(a) && !Array.isArray(b)) || (!Array.isArray(a) && Array.isArray(b))) return false;
	const newA = ignoreArrayOrder && Array.isArray(a) && a.length && typeof a[0] !== "object" ? [...a].sort() : a;
	const newB = ignoreArrayOrder && Array.isArray(b) && b.length && typeof b[0] !== "object" ? [...b].sort() : b;
	for (const key in newA) {
		if (ignoreUndefined && newA[key] === undefined && newB[key] === undefined) continue;
		if (!(key in newB)) return false;
		if (typeof newA[key] === "object" && typeof newB[key] === "object") {
			if (!deepEquals(newA[key], newB[key], { ignoreUndefined, ignoreArrayOrder })) return false;
		} else if (newA[key] !== newB[key]) return false;
	}
	for (const key in newB) {
		if (ignoreUndefined && newA[key] === undefined && newB[key] === undefined) continue;
		if (!(key in newA)) return false;
		if (typeof newB[key] === "object" && typeof newA[key] === "object") {
			if (!deepEquals(newA[key], newB[key], { ignoreUndefined, ignoreArrayOrder })) return false;
		} else if (newA[key] !== newB[key]) return false;
	}
	return true;
}

/**
 * Options for {@link deepEquals}.
 */
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

/**
 * Converts a string in snake_case to camelCase.
 * @param str The string to convert.
 */
export function snakeToCamelCase(str: string): string {
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
export function pascalToCamelCase(str: string): string {
	return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * Checks if `array` is an array and its elements are typeof of `type`
 * @param array The array to check.
 * @param type The type to check the elements' type against.
 * @returns Whether the array is an array and its elements are typeof of `type`.
 */
export function isArrayOf<T>(
	array: T[],
	type: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"
): boolean {
	if (!Array.isArray(array)) return false;
	return array.every(item => typeof item === type);
}

/* eslint-disable @typescript-eslint/ban-types, func-names */
/**
 * Defines an abstract method to a class to produce a runtime error.
 * @param Class The class to patch.
 * @param method The name of the method to patch.
 */
export function patchAbstract(Class: Function, method: string): void {
	Object.defineProperty(Class.prototype, method, {
		configurable: true,
		enumerable: false,
		writable: true,
		value: function () {
			throw new AkairoError("NOT_IMPLEMENTED", this.constructor.name, method);
		}
	});
}
/* eslint-enable @typescript-eslint/ban-types, func-names */

// credit https://stackoverflow.com/a/54178819/16940811
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
