import { codeBlock } from "discord.js";
import { inspect } from "node:util";
import { Argument, Command, type TextCommandMessage } from "../../../../src/index.js";

const { compose, range, union } = Argument;

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
					type: compose((m, s) => s.replace(/\s/g, ""), range(union("integer", "emojint"), 0, 50))
				}
			]
		});
	}

	public override exec(message: TextCommandMessage, args: { y: number }) {
		message.channel.send(codeBlock("js", `${inspect(args, { depth: 1 })}`));
	}
}
