/* eslint-disable */
import { ApplicationCommandOptionType } from "discord.js";
import { describe, expect, it } from "vitest";
import { Command } from "../lib.js";

class TestCommand extends Command {}

describe("Command", () => {
	it("should error with no parameters", () => {
		// @ts-expect-error: no parameters
		expect(() => new TestCommand()).toThrow();
	});

	it("should error with incorrectly typed parameters", () => {
		// @ts-expect-error: number provided for id
		expect(() => new TestCommand(1)).toThrow();
		// @ts-expect-error: bigint provided for id
		expect(() => new TestCommand(1n)).toThrow();
		// @ts-expect-error: object provided for type
		expect(() => new TestCommand({})).toThrow();
		// @ts-expect-error: number provided for type & options is not an object
		expect(() => new TestCommand(1, 1)).toThrow();
		// @ts-expect-error: options is provided null
		expect(() => new TestCommand("name", null)).toThrow();
	});

	it("should only accept valid options", () => {
		expect(
			new TestCommand("name", {
				slashOptions: [
					{
						name: "string_arg",
						description: "description",
						type: ApplicationCommandOptionType.String,
						required: true,
						choices: [],
						autocomplete: false,
						resolve: "Attachment"
					},
					{
						name: "number_arg",
						description: "description",
						type: ApplicationCommandOptionType.Number,
						required: true,
						autocomplete: true,
						resolve: "Integer"
					}
				]
			})
		).toBeInstanceOf(TestCommand);
	});
});
