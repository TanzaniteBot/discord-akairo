/* eslint-disable no-console */

import { Argument, Command } from "#discord-akairo";
import { Formatters, Message } from "discord.js";
import util from "util";

export default class Test2Command extends Command {
	public constructor() {
		super("test2", {
			aliases: ["test2"],
			cooldown: 5000,
			prefix: () => ["/", ">"],
			args: [
				{
					id: "y",
					match: "rest",
					type: Argument.compose(
						(m, s) => s.replace(/\s/g, ""),
						Argument.range(Argument.union("integer", "emojint"), 0, 50)
					)
				}
			]
		});
	}

	public override exec(message: Message, args: { y: number }) {
		message.channel.send(Formatters.codeBlock("js", `${util.inspect(args, { depth: 1 })}`));
	}
}
