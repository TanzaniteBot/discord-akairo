/* eslint-disable no-console */

import { Formatters, Message } from "discord.js";
import util from "util";
import { Command } from "../../src/index";

export default class UnorderedCommand extends Command {
	constructor() {
		super("unordered", {
			aliases: ["unordered", "un"],
			args: [
				{
					id: "integer1",
					unordered: true,
					type: "integer"
				},
				{
					id: "integer2",
					unordered: true,
					type: "integer"
				}
			]
		});
	}

	override exec(message: Message, args: { integer1: number; integer2: number }) {
		message.channel.send(Formatters.codeBlock(`js${util.inspect(args, { depth: 1 })}`));
	}
}
