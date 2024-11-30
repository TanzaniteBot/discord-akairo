import { codeBlock } from "discord.js";
import { inspect } from "node:util";
import { Command, type TextCommandMessage } from "../../../../src/index.js";

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

	public override exec(message: TextCommandMessage, args: { thing: string }) {
		message.channel.send(codeBlock("js", `${inspect(args, { depth: 1 })}`));
	}
}
