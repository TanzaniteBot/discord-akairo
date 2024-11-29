import { ApplicationCommandType, BitField } from "discord.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ContextMenuCommand } from "../../../src/index.js";

class TestCommand extends ContextMenuCommand {
	public exec() {
		// @ts-expect-error: super.exec is monkey patched and should throw an error when called
		super.exec();
	}
}

describe("ContextMenuCommand", () => {
	it("should error with no parameters", () => {
		// @ts-expect-error: no parameters
		assert.throws(() => new TestCommand());
	});

	it("should error with incorrectly typed parameters", () => {
		// @ts-expect-error: number provided for id
		assert.throws(() => new TestCommand(1));
		// @ts-expect-error: bigint provided for id
		assert.throws(() => new TestCommand(1n));
		// @ts-expect-error: object provided for type
		assert.throws(() => new TestCommand({}));
		// @ts-expect-error: number provided for type & options is not an object
		assert.throws(() => new TestCommand(1, 1));
		// @ts-expect-error: options is provided null
		assert.throws(() => new TestCommand("name", null));
	});

	it("should only accept valid options", () => {
		// @ts-expect-error: missing required properties
		assert.throws(() => new TestCommand("name", {}));
		// @ts-expect-error: options.name should be of type string
		assert.throws(() => new TestCommand("name", { name: 1 }));
		// @ts-expect-error: options.type is required
		assert.throws(() => new TestCommand("name", { name: "name" }));
		// @ts-expect-error
		assert.throws(() => new TestCommand("name", { name: "name" }));
		// @ts-expect-error
		assert.throws(() => new TestCommand("name", { name: "name", type: ApplicationCommandType.ChatInput }));
		assert(new TestCommand("name", { name: "name", type: ApplicationCommandType.Message }) instanceof TestCommand);
		assert(new TestCommand("name", { name: "name", type: 3 }) instanceof TestCommand);
		const base = { name: "name", type: ApplicationCommandType.Message } as const;
		assert(new TestCommand("name", { ...base, category: "category", guilds: [], dmPermission: true }) instanceof TestCommand);
		assert.throws(() => new TestCommand("name", { ...base, category: "category", guilds: ["8327401987"], dmPermission: true }));
		assert(
			new TestCommand("name", { ...base, nameLocalizations: { "en-GB": "name", "en-US": "name", "es-ES": "name" } }) instanceof
				TestCommand
		);
		assert(
			new TestCommand("name", { ...base, defaultMemberPermissions: ["AddReactions", "Administrator", "BanMembers"] }) instanceof
				TestCommand
		);
		assert(new TestCommand("name", { ...base, defaultMemberPermissions: "AddReactions" }) instanceof TestCommand);
		assert(new TestCommand("name", { ...base, defaultMemberPermissions: 8n }) instanceof TestCommand);
		assert(new TestCommand("name", { ...base, defaultMemberPermissions: [8n] }) instanceof TestCommand);
		assert(new TestCommand("name", { ...base, defaultMemberPermissions: new BitField() }) instanceof TestCommand);
		assert(new TestCommand("name", { ...base, defaultMemberPermissions: [new BitField()] }) instanceof TestCommand);
		// @ts-expect-error
		assert.throws(() => new TestCommand("name", { ...base, defaultMemberPermissions: {} }));
	});

	it("should error if exec is called when not implemented", () => {
		const instance = new TestCommand("name", { name: "name", type: ApplicationCommandType.Message });

		assert.throws(() => instance.exec());
	});

	it("should correctly assign defaults", () => {
		const instance = new TestCommand("name", { name: "name", type: ApplicationCommandType.Message });

		assert.equal(instance.name, "name");
		assert.equal(instance.type, ApplicationCommandType.Message);
		assert.equal(instance.category, null);
		assert.deepEqual(instance.guilds, []);
		assert.equal(instance.dmPermission, true);
		assert.equal(instance.nameLocalizations, undefined);
		assert.equal(instance.defaultMemberPermissions, undefined);
	});
});
