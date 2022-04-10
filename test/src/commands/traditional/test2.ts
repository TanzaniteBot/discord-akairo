import { Argument, Command } from "#discord-akairo";
import { Formatters, Message } from "discord.js";
import util from "util";
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

	public override exec(message: Message, args: { y: number }) {
		message.channel.send(Formatters.codeBlock("js", `${util.inspect(args, { depth: 1 })}`));
	}
}
