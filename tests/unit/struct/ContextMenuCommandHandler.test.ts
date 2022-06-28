/* eslint-disable */
import { describe, expect, it, vi } from "vitest";
import { AkairoClient, ContextMenuCommandHandler } from "../../../dist/src/index.js";

describe("ContextMenuCommand", () => {
	const client = new AkairoClient({ intents: [] });

	it("should error with no parameters", () => {
		// @ts-expect-error
		expect(() => new ContextMenuCommandHandler()).toThrow();
	});

	it("should error with incorrectly typed parameters", () => {
		// @ts-expect-error
		expect(() => new ContextMenuCommandHandler(1)).toThrow();
		// @ts-expect-error
		expect(() => new ContextMenuCommandHandler(1n)).toThrow();
		// @ts-expect-error
		expect(() => new ContextMenuCommandHandler({})).toThrow();
		// @ts-expect-error
		expect(() => new ContextMenuCommandHandler(1, 1)).toThrow();
		// @ts-expect-error
		expect(() => new ContextMenuCommandHandler("name", null)).toThrow();
		// @ts-expect-error
		expect(() => new ContextMenuCommandHandler(client)).toThrow();
		// @ts-expect-error
		expect(() => new ContextMenuCommandHandler(client, {})).toThrow();
	});

	it("should call setup after construction", () => {
		// @ts-ignore
		const spy = vi.spyOn(ContextMenuCommandHandler.prototype, "setup");
		expect(spy).toHaveBeenCalledTimes(0);
		new ContextMenuCommandHandler(client, { directory: "" });
		expect(spy).toHaveBeenCalledOnce();
	});
});
