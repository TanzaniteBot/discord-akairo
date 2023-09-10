/* eslint-disable */
import { ApplicationCommandOptionType } from "discord.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Command } from "../../../src/index.js";

class TestCommand extends Command {}

describe("Command", () => {
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
		assert(
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
			}) instanceof TestCommand
		);
	});
});
