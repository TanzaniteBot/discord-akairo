/* eslint-disable */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AkairoClient, ContextMenuCommandHandler } from "../../../src/index.js";

describe("ContextMenuCommand", () => {
	const client = new AkairoClient({ intents: [] });

	it("should error with no parameters", () => {
		// @ts-expect-error
		assert.throws(() => new ContextMenuCommandHandler());
	});

	it("should error with incorrectly typed parameters", () => {
		// @ts-expect-error
		assert.throws(() => new ContextMenuCommandHandler(1));
		// @ts-expect-error
		assert.throws(() => new ContextMenuCommandHandler(1n));
		// @ts-expect-error
		assert.throws(() => new ContextMenuCommandHandler({}));
		// @ts-expect-error
		assert.throws(() => new ContextMenuCommandHandler(1, 1));
		// @ts-expect-error
		assert.throws(() => new ContextMenuCommandHandler("name", null));
		// @ts-expect-error
		assert.throws(() => new ContextMenuCommandHandler(client));
		// @ts-expect-error
		assert.throws(() => new ContextMenuCommandHandler(client, {}));
	});

	it("should call setup after construction", t => {
		t.mock.method(
			ContextMenuCommandHandler.prototype,
			// @ts-expect-error
			"setup"
		);

		// @ts-expect-error
		assert(ContextMenuCommandHandler.prototype["setup"].mock.calls.length === 0);

		new ContextMenuCommandHandler(client, { directory: "" });

		// @ts-expect-error
		assert(ContextMenuCommandHandler.prototype["setup"].mock.calls.length === 1);
	});
});
