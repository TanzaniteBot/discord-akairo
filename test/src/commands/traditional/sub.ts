/* eslint-disable no-console */

import { Command } from "discord-akairo";
import { Formatters, Message } from "discord.js";
import util from "util";

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
		message.channel.send(Formatters.codeBlock("js", `${util.inspect(args, { depth: 1 })}`));
	}
}
