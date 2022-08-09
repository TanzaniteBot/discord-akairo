/* eslint-disable */
import { ApplicationCommandType, BitField } from "discord.js";
import { describe, expect, it } from "vitest";
import { ContextMenuCommand } from "../lib.js";

class TestCommand extends ContextMenuCommand {
	public exec() {
		// @ts-expect-error
		super.exec();
	}
}

describe("ContextMenuCommand", () => {
	it("should error with no parameters", () => {
		// @ts-expect-error
		expect(() => new TestCommand()).toThrow();
	});

	it("should error with incorrectly typed parameters", () => {
		// @ts-expect-error
		expect(() => new TestCommand(1)).toThrow();
		// @ts-expect-error
		expect(() => new TestCommand(1n)).toThrow();
		// @ts-expect-error
		expect(() => new TestCommand({})).toThrow();
		// @ts-expect-error
		expect(() => new TestCommand(1, 1)).toThrow();
		// @ts-expect-error
		expect(() => new TestCommand("name", null)).toThrow();
	});

	it("should only accept valid options", () => {
		// @ts-expect-error
		expect(() => new TestCommand("name", {})).toThrow();
		// @ts-expect-error
		expect(() => new TestCommand("name", { name: 1 })).toThrow();
		// @ts-expect-error
		expect(() => new TestCommand("name", { name: "name" })).toThrow();
		// @ts-expect-error
		expect(() => new TestCommand("name", { name: "name" })).toThrow();
		// @ts-expect-error
		expect(() => new TestCommand("name", { name: "name", type: ApplicationCommandType.ChatInput })).toThrow();
		expect(new TestCommand("name", { name: "name", type: ApplicationCommandType.Message })).toBeInstanceOf(TestCommand);
		expect(new TestCommand("name", { name: "name", type: 3 })).toBeInstanceOf(TestCommand);
		const base = { name: "name", type: ApplicationCommandType.Message } as const;
		expect(new TestCommand("name", { ...base, category: "category", guilds: [], dmPermission: true })).toBeInstanceOf(
			TestCommand
		);
		expect(
			() => new TestCommand("name", { ...base, category: "category", guilds: ["8327401987"], dmPermission: true })
		).toThrow();
		expect(
			new TestCommand("name", { ...base, nameLocalizations: { "en-GB": "name", "en-US": "name", "es-ES": "name" } })
		).toBeInstanceOf(TestCommand);
		expect(
			new TestCommand("name", { ...base, defaultMemberPermissions: ["AddReactions", "Administrator", "BanMembers"] })
		).toBeInstanceOf(TestCommand);
		expect(new TestCommand("name", { ...base, defaultMemberPermissions: "AddReactions" })).toBeInstanceOf(TestCommand);
		expect(new TestCommand("name", { ...base, defaultMemberPermissions: 8n })).toBeInstanceOf(TestCommand);
		expect(new TestCommand("name", { ...base, defaultMemberPermissions: [8n] })).toBeInstanceOf(TestCommand);
		expect(new TestCommand("name", { ...base, defaultMemberPermissions: new BitField() })).toBeInstanceOf(TestCommand);
		expect(new TestCommand("name", { ...base, defaultMemberPermissions: [new BitField()] })).toBeInstanceOf(TestCommand);
		expect(
			// @ts-expect-error
			() => new TestCommand("name", { ...base, defaultMemberPermissions: {} })
		).toThrow();
	});

	it("should error if exec is called when not implemented", () => {
		const instance = new TestCommand("name", { name: "name", type: ApplicationCommandType.Message });

		expect(() => instance.exec()).toThrow();
	});

	it("should correctly assign defaults", () => {
		const instance = new TestCommand("name", { name: "name", type: ApplicationCommandType.Message });

		expect(instance.name).toBe("name");
		expect(instance.type).toBe(ApplicationCommandType.Message);
		expect(instance.category).toBe(null);
		expect(instance.guilds).toEqual([]);
		expect(instance.dmPermission).toBe(true);
		expect(instance.nameLocalizations).toEqual(undefined);
		expect(instance.defaultMemberPermissions).toBe(undefined);
	});
});
