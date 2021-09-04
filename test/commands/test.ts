/* eslint-disable no-console */

import { Formatters, Message } from "discord.js";
import util from "util";
import { Argument, Command } from "../../src/index";

export default class TestCommand extends Command {
	constructor() {
		super("test", {
			aliases: ["test", "test-a"],
			cooldown: 5000,
			prefix: ["$", "%"],
			args: [
				{
					id: "x",
					match: "rest",
					type: Argument.compose(
						(m, s) => s.replace(/\s/g, ""),
						Argument.range(Argument.union("integer", "emojint"), 0, 50)
					)
				}
			]
		});
	}

	override exec(message: Message, args: { x: number }) {
		message.channel.send(Formatters.codeBlock(`js${util.inspect(args, { depth: 1 })}`));
	}
}
