/* eslint-disable */
import EventEmitter from "events";
import { describe, expect, it } from "vitest";
import { AkairoError, Util } from "../lib.js";
const {
	deepAssign,
	intoArray,
	intoCallable,
	isEventEmitter,
	isPromise,
	prefixCompare,
	deepEquals,
	snakeToCamelCase,
	pascalToCamelCase,
	isArrayOf,
	patchAbstract
} = Util;

class Class {}

describe("deepAssign", () => {
	it("assigns shallow objects", () => {
		expect(deepAssign({ a: 1, b: 2 }, { c: 3 })).toStrictEqual({ a: 1, b: 2, c: 3 });
		expect(deepAssign({ a: 1, b: undefined }, { c: 3 })).toStrictEqual({ a: 1, b: undefined, c: 3 });
		expect(deepAssign({ a: false, b: null }, { c: 0 })).toStrictEqual({ a: false, b: null, c: 0 });
	});

	it("assigns deep objects", () => {
		expect(deepAssign({ a: { b: 1 } }, { a: { c: 2 } })).toStrictEqual({ a: { b: 1, c: 2 } });
		expect(deepAssign({ a: { b: undefined } }, { a: { b: 1 } })).toStrictEqual({ a: { b: 1 } });
		expect(deepAssign({ a: { b: 1 } }, { a: { b: undefined } })).toStrictEqual({ a: { b: undefined } });
	});
});

describe("intoArray", () => {
	it("doesn't do anything to array values", () => {
		expect(intoArray([1, 2, 3])).toEqual([1, 2, 3]);
		expect(intoArray([])).toEqual([]);
	});

	it("converts non-array values to arrays", () => {
		expect(intoArray(1)).toEqual([1]);
		expect(intoArray(1n)).toEqual([1n]);
		expect(intoArray(true)).toEqual([true]);
		expect(intoArray(null)).toEqual([null]);
		expect(intoArray({})).toEqual([{}]);
	});
});

describe("intoCallable", () => {
	it("doesn't do anything to functions", () => {
		expect(intoCallable(() => {}).toString()).toEqual((() => {}).toString());
		expect(intoCallable(Class).toString()).toEqual(Class.toString());
	});

	it("converts non-function values to functions", () => {
		expect(intoCallable(1)).instanceOf(Function);
		expect(intoCallable(1)()).toBe(1);
		expect(intoCallable(1n)).instanceOf(Function);
		expect(intoCallable(1n)()).toBe(1n);
		expect(intoCallable(true)).instanceOf(Function);
		expect(intoCallable(true)()).toBe(true);
		expect(intoCallable(null)).instanceOf(Function);
		expect(intoCallable(null)()).toBe(null);
		expect(intoCallable({})).instanceOf(Function);
		expect(intoCallable({})()).toStrictEqual({});
	});
});

describe("isEventEmitter", () => {
	it("returns true when an object is an event emitter", () => {
		expect(isEventEmitter(new EventEmitter())).toBe(true);
		class CustomEventEmitter extends EventEmitter {}
		expect(isEventEmitter(new CustomEventEmitter())).toBe(true);
	});

	it("returns false when an object is not an event emitter", () => {
		expect(isEventEmitter(null)).toBe(false);
		expect(isEventEmitter(undefined)).toBe(false);
		expect(isEventEmitter(1)).toBe(false);
		expect(isEventEmitter(1n)).toBe(false);
		expect(isEventEmitter(true)).toBe(false);
		expect(isEventEmitter({})).toBe(false);
		expect(isEventEmitter([])).toBe(false);
	});
});

describe("isPromise", () => {
	it("returns true when the value is a promise", () => {
		expect(isPromise(Promise.resolve(1))).toBe(true);
	});

	it("returns false when the value is not a promise", () => {
		expect(isPromise(null)).toBe(false);
		expect(isPromise(undefined)).toBe(false);
		expect(isPromise(1)).toBe(false);
		expect(isPromise(1n)).toBe(false);
		expect(isPromise(true)).toBe(false);
		expect(isPromise({})).toBe(false);
		expect(isPromise([])).toBe(false);
		expect(isPromise(Promise)).toBe(false);
	});
});

describe("prefixCompare", () => {
	it("returns 0 when both parameters are empty strings", () => {
		expect(prefixCompare("", "")).toBe(0);
	});

	it("returns 1 when the first parameter is empty", () => {
		expect(prefixCompare("", "a")).toBe(1);
	});

	it("returns -1 when the second parameter is empty", () => {
		expect(prefixCompare("a", "")).toBe(-1);
	});

	it("returns 0 when both parameters are functions", () => {
		expect(
			prefixCompare(
				() => "",
				() => ""
			)
		).toBe(0);
	});

	it("returns 1 when only the first parameter is a function", () => {
		expect(prefixCompare(() => "", "")).toBe(-1);
		expect(prefixCompare(() => "", "a")).toBe(1);
	});

	it("returns -1 when only the second parameter is a function", () => {
		expect(prefixCompare("", () => "")).toBe(1);
		expect(prefixCompare("a", () => "")).toBe(-1);
	});

	it("returns the difference of two different length strings", () => {
		expect(prefixCompare("1", "12")).toBe("12".length - "1".length);
		expect(prefixCompare("1".repeat(50), "12")).toBe("12".length - "1".repeat(50).length);
	});

	it("uses localCompare when the strings are the same length", () => {
		expect(prefixCompare("a", "a")).toBe("a".localeCompare("a"));
		expect(prefixCompare("a", "b")).toBe("a".localeCompare("b"));
		expect(prefixCompare("b", "a")).toBe("b".localeCompare("a"));
	});
});

describe("deepEquals", () => {
	it("correctly evaluates primitives", () => {
		expect(deepEquals(1, 1)).toBe(true);
		expect(deepEquals(1, 2)).toBe(false);
		expect(deepEquals(2, 1)).toBe(false);
		expect(deepEquals(1n, 1n)).toBe(true);
		expect(deepEquals(1n, 2n)).toBe(false);
		expect(deepEquals(2n, 1n)).toBe(false);
		expect(deepEquals(true, true)).toBe(true);
		expect(deepEquals(true, false)).toBe(false);
		expect(deepEquals(false, true)).toBe(false);
		expect(deepEquals(null, null)).toBe(true);
		expect(deepEquals(null, undefined)).toBe(false);
		expect(deepEquals(undefined, null)).toBe(false);
		expect(deepEquals(undefined, undefined)).toBe(true);
	});

	it("always returns false on mismatched types", () => {
		expect(deepEquals(1, "1")).toBe(false);
		expect(deepEquals("1", 1)).toBe(false);
		expect(deepEquals(1n, 1)).toBe(false);
		expect(deepEquals({}, null)).toBe(false);
		expect(deepEquals(null, {})).toBe(false);
		expect(
			deepEquals(
				() => {},
				() => {}
			)
		).toBe(false);
		// @ts-expect-error
		expect(deepEquals(a => a, null)).toBe(false);
		// @ts-expect-error
		expect(deepEquals(a => a, {})).toBe(false);
		// @ts-expect-error
		expect(deepEquals(null, a => a)).toBe(false);
		// @ts-expect-error
		expect(deepEquals({}, a => a)).toBe(false);
	});

	it("correctly handles different types of objects", () => {
		expect(deepEquals(new Class(), new Class())).toBe(true);
		expect(deepEquals(new Class(), {})).toBe(true);
		class FooBar {
			public foo = "bar";
		}
		const fooBar = { foo: "bar" };
		expect(deepEquals(new FooBar(), fooBar)).toBe(true);
		expect(deepEquals(fooBar, new FooBar())).toBe(true);
		expect(deepEquals(new FooBar(), new FooBar())).toBe(true);
		expect(deepEquals(fooBar, fooBar)).toBe(true);
		expect(deepEquals(fooBar, { ...fooBar })).toBe(true);
	});

	it("correctly handles arrays", () => {
		expect(deepEquals([], [])).toBe(true);
		expect(deepEquals([1], [1])).toBe(true);
		expect(deepEquals([1], [2])).toBe(false);
		expect(deepEquals([1], [])).toBe(false);
		expect(deepEquals([], [1])).toBe(false);
		expect(deepEquals([1, 2], [1, 2])).toBe(true);
		expect(deepEquals([1, 2], [1, 3])).toBe(false);
		expect(deepEquals([1, 2], [1])).toBe(false);
		expect(deepEquals([1, 2], [])).toBe(false);
		expect(deepEquals([], [1, 2])).toBe(false);
		expect(deepEquals([1, 2, 3], [3, 2, 1])).toBe(true);
		expect(deepEquals([1, 2, 3], [3, 2, 1], { ignoreArrayOrder: false })).toBe(false);
	});

	it("correctly handles normal objects", () => {
		expect(deepEquals({}, {})).toBe(true);
		expect(deepEquals({ a: 1 }, { a: 1 })).toBe(true);
		expect(deepEquals({ a: 1 }, { a: 2 })).toBe(false);
		expect(deepEquals({ a: 1 }, { b: 1 })).toBe(false);
		expect(deepEquals({ a: 1 }, {})).toBe(false);
		expect(deepEquals({}, { a: 1 })).toBe(false);
		expect(deepEquals({ a: 1 }, { a: 1, b: 1 })).toBe(false);
		expect(deepEquals({ a: 1, b: 1 }, { b: 1, a: 1 })).toBe(true);
		expect(deepEquals({ a: { a: { a: 1 } } }, { a: { a: { a: 1 } } })).toBe(true);
		expect(deepEquals({ a: { a: { a: 1 } } }, { a: { a: { a: 2 } } })).toBe(false);
		expect(deepEquals({ a: { a: { a: 1 } } }, { a: { b: { a: 1 } } })).toBe(false);
	});

	it("correctly handles undefined values", () => {
		expect(deepEquals({ a: undefined }, { a: undefined })).toBe(true);
		expect(deepEquals({ a: undefined }, { a: undefined }, { ignoreUndefined: false })).toBe(true);
		expect(deepEquals({ a: undefined }, { a: 1 })).toBe(false);
		expect(deepEquals({ a: undefined }, { a: 1 }, { ignoreUndefined: false })).toBe(false);
		expect(deepEquals({ a: undefined }, { b: undefined })).toBe(true);
		expect(deepEquals({ a: undefined }, { b: undefined }, { ignoreUndefined: false })).toBe(false);
	});
});

describe("snakeToCamelCase", () => {
	it("converts lowercase_snake_case into camelCase", () => {
		expect(snakeToCamelCase("foo_bar")).toBe("fooBar");
		expect(snakeToCamelCase("foo_bar_baz")).toBe("fooBarBaz");
		expect(snakeToCamelCase("foo_bar_baz_qux")).toBe("fooBarBazQux");
	});

	it("converts UPPERCASE_SNAKE_CASE into camelCase", () => {
		expect(snakeToCamelCase("FOO_BAR")).toBe("fooBar");
		expect(snakeToCamelCase("FOO_BAR_BAZ")).toBe("fooBarBaz");
		expect(snakeToCamelCase("FOO_BAR_BAZ_QUX")).toBe("fooBarBazQux");
	});

	it("handles empty strings", () => {
		expect(snakeToCamelCase("")).toBe("");
	});
});

describe("pascalToCamelCase", () => {
	it("it converts PascalCase to camelCase", () => {
		expect(pascalToCamelCase("FooBar")).toBe("fooBar");
		expect(pascalToCamelCase("FooBarBaz")).toBe("fooBarBaz");
	});

	it("handles empty strings", () => {
		expect(pascalToCamelCase("")).toBe("");
	});
});

describe("isArrayOf", () => {
	it("returns false if the value is not an array", () => {
		// @ts-expect-error
		expect(isArrayOf("string", "string")).toBe(false);
		// @ts-expect-error
		expect(isArrayOf({}, "object")).toBe(false);
		// @ts-expect-error
		expect(isArrayOf(null, "object")).toBe(false);
	});

	it("returns true on empty arrays", () => {
		expect(isArrayOf([], "string")).toBe(true);
		expect(isArrayOf([], "number")).toBe(true);
		expect(isArrayOf([], "bigint")).toBe(true);
		expect(isArrayOf([], "boolean")).toBe(true);
		expect(isArrayOf([], "symbol")).toBe(true);
		expect(isArrayOf([], "undefined")).toBe(true);
		expect(isArrayOf([], "object")).toBe(true);
		expect(isArrayOf([], "function")).toBe(true);
	});

	it("returns true on arrays of the specified type", () => {
		expect(isArrayOf([1, 2, 3], "number")).toBe(true);
		expect(isArrayOf([1n, 2n, 3n], "bigint")).toBe(true);
		expect(isArrayOf([true, false], "boolean")).toBe(true);
		expect(isArrayOf([Symbol("1"), Symbol("2")], "symbol")).toBe(true);
		expect(isArrayOf([void 0, undefined], "undefined")).toBe(true);
		expect(isArrayOf([{}, null], "object")).toBe(true);
		expect(isArrayOf([() => {}, Class, new Function()], "function")).toBe(true);
	});

	it("returns false on arrays with more than one type", () => {
		expect(isArrayOf(["1", 2, "3"], "string")).toBe(false);
	});

	it("returns false on arrays with the wrong type", () => {
		expect(isArrayOf([1, 2, 3], "bigint")).toBe(false);
		expect(isArrayOf([1n, 2n, 3n], "boolean")).toBe(false);
		expect(isArrayOf([true, false], "symbol")).toBe(false);
		expect(isArrayOf([Symbol("1"), Symbol("2")], "undefined")).toBe(false);
		expect(isArrayOf([void 0, undefined], "object")).toBe(false);
		expect(isArrayOf([{}, null], "function")).toBe(false);
		expect(isArrayOf([() => {}, Class, new Function()], "number")).toBe(false);
	});
});

describe("patchAbstract", () => {
	it("patches the abstract method", () => {
		abstract class AbstractClass {
			abstract method(): void;
		}

		expect(patchAbstract(AbstractClass, "method")).toBeUndefined();
		// @ts-expect-error
		expect(() => new AbstractClass()).not.toThrow();
		// @ts-expect-error
		expect(() => new AbstractClass().method()).toThrow(AkairoError);
	});
});
