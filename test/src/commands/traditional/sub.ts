import { Command } from "#discord-akairo";
import { Formatters, type Message } from "discord.js";
import { inspect } from "node:util";

export default class SubCommand extends Command {
	public constructor() {
		super("sub", {
			args: [
				{
					id: "thing"
				}
			]
		});
	}

	public override exec(message: Message, args: { thing: string }) {
		message.channel.send(Formatters.codeBlock("js", `${inspect(args, { depth: 1 })}`));
	}
}
