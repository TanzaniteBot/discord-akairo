/* eslint-disable */
import EventEmitter from "events";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AkairoError, Util } from "../../../src/index.js";
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
		assert.deepEqual(deepAssign({ a: 1, b: 2 }, { c: 3 }), { a: 1, b: 2, c: 3 });
		assert.deepEqual(deepAssign({ a: 1, b: undefined }, { c: 3 }), { a: 1, b: undefined, c: 3 });
		assert.deepEqual(deepAssign({ a: false, b: null }, { c: 0 }), { a: false, b: null, c: 0 });
	});

	it("assigns deep objects", () => {
		assert.deepEqual(deepAssign({ a: { b: 1 } }, { a: { c: 2 } }), { a: { b: 1, c: 2 } });
		assert.deepEqual(deepAssign({ a: { b: undefined } }, { a: { b: 1 } }), { a: { b: 1 } });
		assert.deepEqual(deepAssign({ a: { b: 1 } }, { a: { b: undefined } }), { a: { b: undefined } });
	});
});

describe("intoArray", () => {
	it("doesn't do anything to array values", () => {
		assert.deepEqual(intoArray([1, 2, 3]), [1, 2, 3]);
		assert.deepEqual(intoArray([]), []);
	});

	it("converts non-array values to arrays", () => {
		assert.deepEqual(intoArray(1), [1]);
		assert.deepEqual(intoArray(1n), [1n]);
		assert.deepEqual(intoArray(true), [true]);
		assert.deepEqual(intoArray(null), [null]);
		assert.deepEqual(intoArray({}), [{}]);
	});
});

describe("intoCallable", () => {
	it("doesn't do anything to functions", () => {
		assert.equal(intoCallable(() => {}).toString(), (() => {}).toString());
		assert.equal(intoCallable(Class).toString(), Class.toString());
	});

	it("converts non-function values to functions", () => {
		assert(intoCallable(1) instanceof Function);
		assert.equal(intoCallable(1)(), 1);
		assert(intoCallable(1n) instanceof Function);
		assert.equal(intoCallable(1n)(), 1n);
		assert(intoCallable(true) instanceof Function);
		assert.equal(intoCallable(true)(), true);
		assert(intoCallable(null) instanceof Function);
		assert.equal(intoCallable(null)(), null);
		assert(intoCallable({}) instanceof Function);
		assert.deepEqual(intoCallable({})(), {});
	});
});

describe("isEventEmitter", () => {
	it("returns true when an object is an event emitter", () => {
		assert.equal(isEventEmitter(new EventEmitter()), true);
		class CustomEventEmitter extends EventEmitter {}
		assert.equal(isEventEmitter(new CustomEventEmitter()), true);
	});

	it("returns false when an object is not an event emitter", () => {
		assert.equal(isEventEmitter(null), false);
		assert.equal(isEventEmitter(undefined), false);
		assert.equal(isEventEmitter(1), false);
		assert.equal(isEventEmitter(1n), false);
		assert.equal(isEventEmitter(true), false);
		assert.equal(isEventEmitter({}), false);
		assert.equal(isEventEmitter([]), false);
	});
});

describe("isPromise", () => {
	it("returns true when the value is a promise", () => {
		assert.equal(isPromise(Promise.resolve(1)), true);
	});

	it("returns false when the value is not a promise", () => {
		assert.equal(isPromise(null), false);
		assert.equal(isPromise(undefined), false);
		assert.equal(isPromise(1), false);
		assert.equal(isPromise(1n), false);
		assert.equal(isPromise(true), false);
		assert.equal(isPromise({}), false);
		assert.equal(isPromise([]), false);
		assert.equal(isPromise(Promise), false);
	});
});

describe("prefixCompare", () => {
	it("returns 0 when both parameters are empty strings", () => {
		assert.equal(prefixCompare("", ""), 0);
	});

	it("returns 1 when the first parameter is empty", () => {
		assert.equal(prefixCompare("", "a"), 1);
	});

	it("returns -1 when the second parameter is empty", () => {
		assert.equal(prefixCompare("a", ""), -1);
	});

	it("returns 0 when both parameters are functions", () => {
		assert.equal(
			prefixCompare(
				() => "",
				() => ""
			),
			0
		);
	});

	it("returns 1 when only the first parameter is a function", () => {
		assert.equal(
			prefixCompare(() => "", ""),
			-1
		);
		assert.equal(
			prefixCompare(() => "", "a"),
			1
		);
	});

	it("returns -1 when only the second parameter is a function", () => {
		assert.equal(
			prefixCompare("", () => ""),
			1
		);
		assert.equal(
			prefixCompare("a", () => ""),
			-1
		);
	});

	it("returns the difference of two different length strings", () => {
		assert.equal(prefixCompare("1", "12"), "12".length - "1".length);
		assert.equal(prefixCompare("1".repeat(50), "12"), "12".length - "1".repeat(50).length);
	});

	it("uses localCompare when the strings are the same length", () => {
		assert.equal(prefixCompare("a", "a"), "a".localeCompare("a"));
		assert.equal(prefixCompare("a", "b"), "a".localeCompare("b"));
		assert.equal(prefixCompare("b", "a"), "b".localeCompare("a"));
	});
});

describe("deepEquals", () => {
	it("correctly evaluates primitives", () => {
		assert.equal(deepEquals(1, 1), true);
		assert.equal(deepEquals(1, 2), false);
		assert.equal(deepEquals(2, 1), false);
		assert.equal(deepEquals(1n, 1n), true);
		assert.equal(deepEquals(1n, 2n), false);
		assert.equal(deepEquals(2n, 1n), false);
		assert.equal(deepEquals(true, true), true);
		assert.equal(deepEquals(true, false), false);
		assert.equal(deepEquals(false, true), false);
		assert.equal(deepEquals(null, null), true);
		assert.equal(deepEquals(null, undefined), false);
		assert.equal(deepEquals(undefined, null), false);
		assert.equal(deepEquals(undefined, undefined), true);
	});

	it("always returns false on mismatched types", () => {
		assert.equal(deepEquals(1, "1"), false);
		assert.equal(deepEquals("1", 1), false);
		assert.equal(deepEquals(1n, 1), false);
		assert.equal(deepEquals({}, null), false);
		assert.equal(deepEquals(null, {}), false);
		assert.equal(
			deepEquals(
				() => {},
				() => {}
			),
			false
		);
		assert.equal(
			// @ts-expect-error
			deepEquals(a => a, null),
			false
		);
		assert.equal(
			// @ts-expect-error
			deepEquals(a => a, {}),
			false
		);
		assert.equal(
			// @ts-expect-error
			deepEquals(null, a => a),
			false
		);
		assert.equal(
			// @ts-expect-error
			deepEquals({}, a => a),
			false
		);
	});

	it("correctly handles different types of objects", () => {
		assert.equal(deepEquals(new Class(), new Class()), true);
		assert.equal(deepEquals(new Class(), {}), true);
		class FooBar {
			public foo = "bar";
		}
		const fooBar = { foo: "bar" };
		assert.equal(deepEquals(new FooBar(), fooBar), true);
		assert.equal(deepEquals(fooBar, new FooBar()), true);
		assert.equal(deepEquals(new FooBar(), new FooBar()), true);
		assert.equal(deepEquals(fooBar, fooBar), true);
		assert.equal(deepEquals(fooBar, { ...fooBar }), true);
	});

	it("correctly handles arrays", () => {
		assert.equal(deepEquals([], []), true);
		assert.equal(deepEquals([1], [1]), true);
		assert.equal(deepEquals([1], [2]), false);
		assert.equal(deepEquals([1], []), false);
		assert.equal(deepEquals([], [1]), false);
		assert.equal(deepEquals([1, 2], [1, 2]), true);
		assert.equal(deepEquals([1, 2], [1, 3]), false);
		assert.equal(deepEquals([1, 2], [1]), false);
		assert.equal(deepEquals([1, 2], []), false);
		assert.equal(deepEquals([], [1, 2]), false);
		assert.equal(deepEquals([1, 2, 3], [3, 2, 1]), true);
		assert.equal(deepEquals([1, 2, 3], [3, 2, 1], { ignoreArrayOrder: false }), false);
	});

	it("correctly handles normal objects", () => {
		assert.equal(deepEquals({}, {}), true);
		assert.equal(deepEquals({ a: 1 }, { a: 1 }), true);
		assert.equal(deepEquals({ a: 1 }, { a: 2 }), false);
		assert.equal(deepEquals({ a: 1 }, { b: 1 }), false);
		assert.equal(deepEquals({ a: 1 }, {}), false);
		assert.equal(deepEquals({}, { a: 1 }), false);
		assert.equal(deepEquals({ a: 1 }, { a: 1, b: 1 }), false);
		assert.equal(deepEquals({ a: 1, b: 1 }, { b: 1, a: 1 }), true);
		assert.equal(deepEquals({ a: { a: { a: 1 } } }, { a: { a: { a: 1 } } }), true);
		assert.equal(deepEquals({ a: { a: { a: 1 } } }, { a: { a: { a: 2 } } }), false);
		assert.equal(deepEquals({ a: { a: { a: 1 } } }, { a: { b: { a: 1 } } }), false);
	});

	it("correctly handles undefined values", () => {
		assert.equal(deepEquals({ a: undefined }, { a: undefined }), true);
		assert.equal(deepEquals({ a: undefined }, { a: undefined }, { ignoreUndefined: false }), true);
		assert.equal(deepEquals({ a: undefined }, { a: 1 }), false);
		assert.equal(deepEquals({ a: undefined }, { a: 1 }, { ignoreUndefined: false }), false);
		assert.equal(deepEquals({ a: undefined }, { b: undefined }), true);
		assert.equal(deepEquals({ a: undefined }, { b: undefined }, { ignoreUndefined: false }), false);
	});
});

describe("snakeToCamelCase", () => {
	it("converts lowercase_snake_case into camelCase", () => {
		assert.equal(snakeToCamelCase("foo_bar"), "fooBar");
		assert.equal(snakeToCamelCase("foo_bar_baz"), "fooBarBaz");
		assert.equal(snakeToCamelCase("foo_bar_baz_qux"), "fooBarBazQux");
	});

	it("converts UPPERCASE_SNAKE_CASE into camelCase", () => {
		assert.equal(snakeToCamelCase("FOO_BAR"), "fooBar");
		assert.equal(snakeToCamelCase("FOO_BAR_BAZ"), "fooBarBaz");
		assert.equal(snakeToCamelCase("FOO_BAR_BAZ_QUX"), "fooBarBazQux");
	});

	it("handles empty strings", () => {
		assert.equal(snakeToCamelCase(""), "");
	});
});

describe("pascalToCamelCase", () => {
	it("it converts PascalCase to camelCase", () => {
		assert.equal(pascalToCamelCase("FooBar"), "fooBar");
		assert.equal(pascalToCamelCase("FooBarBaz"), "fooBarBaz");
	});

	it("handles empty strings", () => {
		assert.equal(pascalToCamelCase(""), "");
	});
});

describe("isArrayOf", () => {
	it("returns false if the value is not an array", () => {
		// @ts-expect-error
		assert.equal(isArrayOf("string", "string"), false);
		// @ts-expect-error
		assert.equal(isArrayOf({}, "object"), false);
		// @ts-expect-error
		assert.equal(isArrayOf(null, "object"), false);
	});

	it("returns true on empty arrays", () => {
		assert.equal(isArrayOf([], "string"), true);
		assert.equal(isArrayOf([], "number"), true);
		assert.equal(isArrayOf([], "bigint"), true);
		assert.equal(isArrayOf([], "boolean"), true);
		assert.equal(isArrayOf([], "symbol"), true);
		assert.equal(isArrayOf([], "undefined"), true);
		assert.equal(isArrayOf([], "object"), true);
		assert.equal(isArrayOf([], "function"), true);
	});

	it("returns true on arrays of the specified type", () => {
		assert.equal(isArrayOf([1, 2, 3], "number"), true);
		assert.equal(isArrayOf([1n, 2n, 3n], "bigint"), true);
		assert.equal(isArrayOf([true, false], "boolean"), true);
		assert.equal(isArrayOf([Symbol("1"), Symbol("2")], "symbol"), true);
		assert.equal(isArrayOf([void 0, undefined], "undefined"), true);
		assert.equal(isArrayOf([{}, null], "object"), true);
		assert.equal(isArrayOf([() => {}, Class, new Function()], "function"), true);
	});

	it("returns false on arrays with more than one type", () => {
		assert.equal(isArrayOf(["1", 2, "3"], "string"), false);
	});

	it("returns false on arrays with the wrong type", () => {
		assert.equal(isArrayOf([1, 2, 3], "bigint"), false);
		assert.equal(isArrayOf([1n, 2n, 3n], "boolean"), false);
		assert.equal(isArrayOf([true, false], "symbol"), false);
		assert.equal(isArrayOf([Symbol("1"), Symbol("2")], "undefined"), false);
		assert.equal(isArrayOf([void 0, undefined], "object"), false);
		assert.equal(isArrayOf([{}, null], "function"), false);
		assert.equal(isArrayOf([() => {}, Class, new Function()], "number"), false);
	});
});

describe("patchAbstract", () => {
	it("patches the abstract method", () => {
		abstract class AbstractClass {
			abstract method(): void;
		}

		assert.equal(patchAbstract(AbstractClass, "method"), undefined);
		// @ts-expect-error
		assert.doesNotThrow(() => new AbstractClass());
		// @ts-expect-error
		assert.throws(() => new AbstractClass().method(), AkairoError);
	});
});
