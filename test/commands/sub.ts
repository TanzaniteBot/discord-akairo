/* eslint-disable no-console */

import { Formatters, Message } from "discord.js";
import util from "util";
import { Command } from "../../src/index";

export default class SubCommand extends Command {
	constructor() {
		super("sub", {
			args: [
				{
					id: "thing"
				}
			]
		});
	}

	override exec(message: Message, args: { thing: string }) {
		message.channel.send(Formatters.codeBlock(`js${util.inspect(args, { depth: 1 })}`));
	}
}
