/* eslint-disable no-console */

import { Argument, Command } from "#discord-akairo";
import { Formatters, Message } from "discord.js";
import util from "util";

export default class TestCommand extends Command {
	public constructor() {
		super("test", {
			aliases: ["test", "test-a"],
			cooldown: 5000,
			prefix: ["$", "%"],
			args: [
				{
					id: "x",
					match: "rest",
					type: Argument.compose((m, s) => s.replace(/\s/g, ""), Argument.range(Argument.union("integer", "emojint"), 0, 50))
				}
			]
		});
	}

	public override exec(message: Message, args: { x: number }) {
		message.channel.send(Formatters.codeBlock("js", `${util.inspect(args, { depth: 1 })}`));
	}
}
