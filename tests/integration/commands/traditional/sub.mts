import { codeBlock, type Message } from "discord.js";
import { inspect } from "node:util";
import { Command } from "../../../../src/index.js";

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
		message.channel.send(codeBlock("js", `${inspect(args, { depth: 1 })}`));
	}
}
